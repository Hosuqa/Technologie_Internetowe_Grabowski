const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());
app.use(
  session({
    secret: 'super-secret-key-do-lab02',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.static('public'));

app.post('/api/products', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Nazwa i cena są wymagane.' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Cena musi być liczbą nieujemną.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name,
        price: price,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się utworzyć produktu.' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się pobrać produktów.' });
  }
});

const ensureCart = (req, res, next) => {
  if (!req.session) {
    console.error('Brak sesji!');
    return res.status(500).json({ error: 'Błąd sesji' });
  }
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
};

app.use('/api/cart', ensureCart);

app.get('/api/cart', (req, res) => {
  try {
    res.json(req.session.cart);
  } catch (error) {
    console.error('Błąd przy pobieraniu koszyka:', error);
    res.status(500).json({ error: 'Błąd przy pobieraniu koszyka' });
  }
});

app.post('/api/cart/add', async (req, res) => {
  const { product_id, qty } = req.body;

  if (!product_id || !qty || typeof qty !== 'number' || qty < 1) {
    return res.status(400).json({ error: 'Niepoprawne product_id lub ilość (qty >= 1).' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(product_id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie istnieje.' });
    }

    const existingItem = req.session.cart.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      req.session.cart.push({ product_id: product.id, qty: qty });
    }

    res.status(200).json(req.session.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera przy dodawaniu do koszyka.' });
  }
});

app.patch('/api/cart/item', (req, res) => {
  const { product_id, qty } = req.body;

  if (!product_id || !qty || typeof qty !== 'number' || qty < 1) {
    return res.status(400).json({ error: 'Niepoprawna ilość (qty >= 1).' });
  }

  const itemToUpdate = req.session.cart.find(
    (item) => item.product_id === parseInt(product_id)
  );

  if (itemToUpdate) {
    itemToUpdate.qty = qty;
    res.status(200).json(req.session.cart);
  } else {
    res.status(404).json({ error: 'Produktu nie ma w koszyku.' });
  }
});

app.delete('/api/cart/item/:product_id', (req, res) => {
  const productIdToDelete = parseInt(req.params.product_id);

  if (isNaN(productIdToDelete)) {
    return res.status(400).json({ error: 'Niepoprawne ID produktu.' });
  }

  const initialLength = req.session.cart.length;
  
  req.session.cart = req.session.cart.filter(
    (item) => item.product_id !== productIdToDelete
  );

  if (req.session.cart.length < initialLength) {
    res.status(200).json(req.session.cart);
  } else {
    res.status(404).json({ error: 'Produktu nie znaleziono w koszyku.' });
  }
});

app.post('/api/checkout', async (req, res) => {
  const cart = req.session.cart;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Koszyk jest pusty.' });
  }

  try {
    const productIds = cart.map((item) => item.product_id);

    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productPriceMap = new Map(
      productsInDb.map((product) => [product.id, product.price])
    );

    let total = 0;
    const orderItemsData = [];

    for (const item of cart) {
      const price = productPriceMap.get(item.product_id);

      if (price === undefined) {
        throw new Error(`Produkt o ID ${item.product_id} nie został znaleziony w bazie.`);
      }

      orderItemsData.push({
        productId: item.product_id,
        qty: item.qty,
        price: price,
      });

      total += price * item.qty;
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {},
      });

      const itemsToCreate = orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await tx.orderItem.createMany({
        data: itemsToCreate,
      });

      return { orderId: order.id };
    });

    req.session.cart = [];

    res.status(201).json({
      order_id: result.orderId,
      total: total,
    });
  } catch (error) {
    console.error('Błąd podczas finalizacji zamówienia:', error);
    res.status(500).json({ error: 'Nie udało się przetworzyć zamówienia.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
});