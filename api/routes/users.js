const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

//import modelu usera
const User = require('../models/user');

//założenie konta usera
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ wiadomość: err });
    } else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then((user) => {
          res.status(201).json({
            wiadomość: 'Stworzono konto',
            info: user,
          });
        })
        .catch((err) => res.status(500).json({ wiadomość: err }));
    }
  });
});

//usunięcie usera
router.delete('/:userId', (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .then((user) => {
      res.status(200).json({ wiadomość: 'Usunięto konto' });
    })
    .catch((err) => res.status(500).json({ wiadomość: err }));
});

//logowanie się na konto
router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ wiadomość: 'Błąd autoryzacji' });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          res.status(500).json({ wiadomość: err });
        }
        if (result) {
          //stworzenie JWT
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.hasloJWT,
            {
              expiresIn: "1h"
            }
          );
          res.status(200).json({
            wiadomość: 'Zalogowano użytkownika',
            token: token
          });
        } else {
          res.status(401).json({ wiadomość: 'Błąd autoryzacji' });
        }
      });
    })
    .catch((err) => res.status(500).json({ wiadomość: err }));
});

module.exports = router;