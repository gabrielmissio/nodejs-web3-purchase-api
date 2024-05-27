const jwt = require('jsonwebtoken')
const userRepository = require('../../infra/repositories/user-repository')
const { verifyPassword, hashPassword } = require('../../utils/auth-helper')

async function login (req, res) {
  try {
    const { username, password } = req.body
  
    const user = await userRepository.findOne({ username })
    if (!user) {
      // ** This is a security vulnerability. **
      // return res.status(404).json({ error: 'User not found' })
      // ** An attacker can use this to determine if a user exists in the system. **
      console.log('User not found')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // NOTE: use a different salt for each user is a good practice
    const isPasswordMatch = verifyPassword(password, user.password, user.salt)
    if (!isPasswordMatch) {
      console.log('Invalid password')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user._id },
      process.env.AUTH_JWT_SECRET,
      { expiresIn: '1h' },
    )

    return res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function signup (req, res) {
  try {
    const { username, password } = req.body

    const existingUser = await userRepository.findOne({ username })
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    const { salt, hash } = hashPassword(password)
    const user = await userRepository.create({
      salt,
      username,
      password: hash,
    })

    const token = jwt.sign(
      { id: user._id },
      process.env.AUTH_JWT_SECRET,
      { expiresIn: '1h' },
    )

    return res.status(201).json({ token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  login,
  signup,
}
