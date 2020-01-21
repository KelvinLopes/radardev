const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    if (devs === []) {
      return res.json({ message: 'List empty' });
    }

    return res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (dev) {
      res.status(400).json({ message: 'User already exists!' });
    }

    if (!dev) {
      const apiResponse = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name, avatar_url, bio } = apiResponse.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      });

      /* Filtra os devs com um raio de 10km da localização
       * de origem e com pelo menos uma tech que tem
       * cadastrado no devRadar
       */

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      );
      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }
    return res.json(dev);
  },

  async update(req, res) {
    const { _id } = req.params;
    const { techs, latitude, longitude } = req.body;

    const techsArray = parseStringAsArray(techs);

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    try {
      let dev = await Dev.findByIdAndUpdate(
        {
          _id,
        },

        {
          $set: [techsArray],

          latitude,
          longitude,
        },

        {
          new: true,
        }
      );

      if (!dev) {
        return res
          .status(400)
          .json({ error: 'User not found or already removed!' });
      }

      dev = await Dev.findById(_id).updateOne({ techs, location });
    } catch (e) {
      return res.status(400).json({ error: 'User not enrollment!' });
    }
    return res.json({
      techs,
      latitude,
      longitude,
    });
  },

  async delete(req, res) {
    const { _id } = req.params;

    const dev = await Dev.findByIdAndDelete(_id);

    if (!dev) {
      return res
        .status(400)
        .json({ error: 'User not found or already removed!' });
    }

    return res.json({
      message: 'User success deleted.',
    });
  },
};
