const Dev = require('../models/Dev');

module.exports = {
  async update(req, res) {
    const { _id } = req.params;
    const { longitude, latitude } = req.body;

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    let coords = await Dev.findByIdAndUpdate(
      {
        _id,
      },
      {
        $set: {
          longitude,
          latitude,
        },
      },
      {
        new: true,
      }
    );

    if (!coords) {
      return res.status(400).json({ error: 'User not enrollment!' });
    }

    coords = await (await Dev.findById(_id)).updateOne({ location });

    return res.json({
      latitude,
      longitude,
    });
  },
};
