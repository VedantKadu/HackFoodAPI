// const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/Customer');

exports.signup = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error('Validation failed.');
//     error.statusCode = 422;
//     error.data = errors.array();
//     throw error;
//   }
// console.log(req.body);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const aptName = req.body.Address.aptName;
  const locality = req.body.Address.locality;
  const street = req.body.Address.street;
  const zipcode = req.body.Address.zipCode;
  const contact = req.body.Contact;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        address: {
            aptName: aptName,
            locality: locality,
            street: street,
            zipCode: zipcode,
        },
        contact: contact,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created!', user: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
        {}
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};