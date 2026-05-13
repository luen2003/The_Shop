import dotenv from 'dotenv'
import colors from 'colors'
import bcrypt from 'bcryptjs'

import users from './data/users.js'
import products from './data/products.js'
import discounts from './data/discounts.js'

import User from './models/userModel.js'
import Product from './models/productModel.js'
import Order from './models/orderModel.js'
import Discount from './models/discountModel.js'

import connectDB from './config/db.js'

dotenv.config()
connectDB()

const importData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Discount.deleteMany()

    // =========================
    // 🔥 HASH PASSWORD USERS
    // =========================
    const usersWithHashedPassword = users.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }))

    const createdDiscounts = await Discount.insertMany(discounts)

    const discountIds = createdDiscounts.map((d) => d._id)

    // gán discount cho user trước khi insert
    usersWithHashedPassword[0].discounts = discountIds
    usersWithHashedPassword[1].discounts = [
      discountIds[1],
      discountIds[2],
    ]

    const createdUsers = await User.insertMany(usersWithHashedPassword)

    const adminUser = createdUsers[0]._id

    const sampleProducts = products.map((p) => ({
      ...p,
      user: adminUser,
    }))

    await Product.insertMany(sampleProducts)

    console.log('DATA IMPORTED SUCCESS'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Discount.deleteMany()

    console.log('DATA DESTROYED'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}