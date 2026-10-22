require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const menu = [
  ['ember-burger','Ember Smash Burger','Burgers','Double smashed beef, aged cheddar, ember sauce.',1890,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85','Popular'],
  ['truffle-burger','Truffle Mushroom Burger','Burgers','Swiss cheese, roasted mushrooms, truffle aioli.',2190,'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=900&q=85','Chef pick'],
  ['crispy-chicken','Crispy Chicken Stack','Burgers','Buttermilk chicken, slaw, house pickles.',1590,'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85',''],
  ['margherita','Margherita Pizza','Pizza','San Marzano tomato, mozzarella, basil.',1790,'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85','Classic'],
  ['pepperoni','Pepperoni Feast','Pizza','Pepperoni, mozzarella, slow-cooked tomato.',2290,'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85','Popular'],
  ['bbq-pizza','Smoky BBQ Chicken Pizza','Pizza','Smoked chicken, red onion, BBQ glaze.',2190,'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',''],
  ['alfredo','Creamy Alfredo Pasta','Pasta','Parmesan cream, herbs, cracked black pepper.',1690,'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85',''],
  ['arrabbiata','Penne Arrabbiata','Pasta','Garlic, chilli, tomato and fresh basil.',1490,'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85','Vegetarian'],
  ['lasagna','Beef Lasagna','Pasta','Slow-braised beef, béchamel, baked cheese.',1990,'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=900&q=85',''],
  ['ribeye','Grilled Ribeye Steak','Grill','Char-grilled ribeye, pepper jus, seasonal sides.',4890,'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=85','Signature'],
  ['bbq-platter','Royal BBQ Platter','Grill','Smoky kebabs, tikka, naan and mint chutney.',3290,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85','For sharing'],
  ['chicken-tikka','Chicken Tikka','Desi','Charred spices, lemon, cooling raita.',1390,'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85',''],
  ['biryani','Royal Chicken Biryani','Desi','Fragrant basmati rice, tender chicken, raita.',1190,'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85','Bestseller'],
  ['karahi','Lahori Chicken Karahi','Desi','Tomato, ginger, green chilli, fresh coriander.',2390,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85',''],
  ['dumplings','Crispy Chicken Dumplings','Asian','Golden dumplings with ginger-soy dip.',1190,'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=85',''],
  ['noodles','Wok Tossed Noodles','Asian','Vegetables, sesame, wok sauce.',1090,'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85',''],
  ['loaded-fries','Loaded Ember Fries','Sides','Crispy fries, cheese sauce, jalapeño, herbs.',890,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85','Popular'],
  ['caesar','Grilled Chicken Caesar','Sides','Romaine, parmesan, croutons, Caesar dressing.',1290,'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=85','Fresh'],
  ['mojito','Mint Lime Mojito','Drinks','Fresh mint, lime, sparkling soda.',590,'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=85',''],
  ['berry-cooler','Berry Citrus Cooler','Drinks','Mixed berries, citrus, crushed ice.',690,'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=85',''],
  ['iced-coffee','Iced Spanish Latte','Drinks','Double espresso, creamy milk, caramel notes.',690,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85','Popular'],
  ['shake','Chocolate Fudge Shake','Drinks','Rich chocolate, vanilla ice cream, cocoa.',790,'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=85',''],
  ['lava-cake','Chocolate Lava Cake','Desserts','Warm chocolate cake with a molten centre.',890,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85','Signature'],
  ['cheesecake','New York Cheesecake','Desserts','Silky cream cheese, buttery biscuit base.',850,'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85',''],
  ['waffles','Belgian Waffles','Desserts','Golden waffles, berries, vanilla cream.',790,'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=900&q=85',''],
  ['icecream','Brownie Sundae','Desserts','Warm brownie, vanilla scoop, chocolate drizzle.',890,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85','']
].map(([id,name,category,description,price,image,tag])=>({id,name,category,description,price,image,tag}));

let Order;
try {
  const orderSchema = new mongoose.Schema({
    customer: { name: {type:String, required:true}, phone:{type:String, required:true}, email:String },
    fulfillment: {type:String, enum:['Delivery','Pickup'], required:true},
    address: String,
    items: [{ id:String, name:String, price:Number, quantity:Number }],
    total: Number,
    status: {type:String, enum:['Received','Preparing','Ready','Out for delivery','Completed','Cancelled'], default:'Received'},
    createdAt: {type:Date, default:Date.now}
  });
  Order = mongoose.model('Order', orderSchema);
} catch (e) { console.error('Model setup issue:', e.message); }

app.get('/api/health', (req,res)=>res.json({ok:true, database: mongoose.connection.readyState===1?'connected':'disconnected'}));
app.get('/api/menu', (req,res)=>res.json(menu));
app.post('/api/orders', async (req,res)=>{
  try {
    const {customer, fulfillment, address, items} = req.body;
    if (!customer?.name?.trim() || !customer?.phone?.trim() || !['Delivery','Pickup'].includes(fulfillment) || !Array.isArray(items) || !items.length) return res.status(400).json({error:'Please provide your name, phone, order type and at least one item.'});
    if (fulfillment==='Delivery' && !address?.trim()) return res.status(400).json({error:'Please enter a delivery address.'});
    const cleanItems = items.map(i=>{const found=menu.find(m=>m.id===i.id); const quantity=Math.max(1,Math.min(20,Number(i.quantity)||1)); if(!found) throw new Error('An item in your cart is unavailable.'); return {id:found.id,name:found.name,price:found.price,quantity};});
    const total=cleanItems.reduce((sum,i)=>sum+i.price*i.quantity,0);
    if (mongoose.connection.readyState!==1) return res.status(503).json({error:'Ordering database is not connected yet. Start MongoDB and try again.'});
    const order=await Order.create({customer,fulfillment,address,items:cleanItems,total});
    res.status(201).json({message:'Order received!',orderId:order._id,total,status:order.status});
  } catch(e) {res.status(400).json({error:e.message||'Could not place order.'});}
});
app.get('/api/admin/orders', async (req,res)=>{
  if (!process.env.ADMIN_KEY || req.get('x-admin-key')!==process.env.ADMIN_KEY) return res.status(401).json({error:'Admin key required.'});
  if(mongoose.connection.readyState!==1) return res.status(503).json({error:'Database disconnected.'});
  const orders=await Order.find().sort({createdAt:-1}).limit(100).lean(); res.json(orders);
});
app.patch('/api/admin/orders/:id', async(req,res)=>{
  if (!process.env.ADMIN_KEY || req.get('x-admin-key')!==process.env.ADMIN_KEY) return res.status(401).json({error:'Admin key required.'});
  const allowed=['Received','Preparing','Ready','Out for delivery','Completed','Cancelled'];
  if(!allowed.includes(req.body.status)) return res.status(400).json({error:'Invalid status.'});
  try {const order=await Order.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true}); if(!order)return res.status(404).json({error:'Order not found.'}); res.json(order);} catch(e){res.status(400).json({error:'Invalid order ID.'});}
});

async function start(){
  try { if(process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI); console.log('MongoDB connected'); }
  catch(e){ console.warn('MongoDB not connected:',e.message); console.warn('Website will load, but placing orders requires MongoDB.'); }
  app.listen(PORT,()=>console.log(`Royal Ember running at http://localhost:${PORT}`));
}
start();
