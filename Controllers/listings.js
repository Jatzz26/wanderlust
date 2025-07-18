const listing = require('../models/listing');

module.exports.RenderIndexPage = async (req, res) => {
  let { Search, category } = req.query;
  if ((!Search || Search === '') && (!category || category === '')) {
    let data = await listing.find();
    res.render('listings/index.ejs', { data });
  } else if (!category || category === '') {
    let Searchdata = await listing.find({
      $or: [
        { location: { $regex: Search, $options: 'i' } },
        { country: { $regex: Search, $options: 'i' } }
      ]
    });
    if (Searchdata.length == 0) {
      req.flash('error', 'Sorry Listing not Available');
      res.redirect('/listings');
    } else {
      res.render('listings/index.ejs', { data: Searchdata });
    }
  } else {
    let categoryData = await listing.find({ category: category });
    if (categoryData.length == 0) {
      req.flash('error', 'Sorry Listing not Available');
      res.redirect('/listings');
    } else {
      res.render('listings/index.ejs', { data: categoryData });
    }
  }
};

module.exports.RenderNewPage = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.CreateNewList = async (req, res) => {
  const url = req.file.path;
  const filename = req.file.filename;
  const newList = req.body.listing;
  newList.owner = req.user._id;
  newList.image = { filename, url };

  const list = new listing(newList);
  await list.save();

  req.flash('success', 'New Listing Created');
  res.redirect('/listings');
};

module.exports.RenderEditPage = async (req, res) => {
  const { id } = req.params;
  const list = await listing.findById(id);
  let imgUrl = list.image.url;
  imgUrl = imgUrl.replace('/upload', '/upload/e_blur:300');
  res.render('listings/edit.ejs', { list, imgUrl });
};

module.exports.EditPage = async (req, res) => {
  const { id } = req.params;
  const newListing = req.body;
  const data = newListing.listing;

  const Listing = await listing.findByIdAndUpdate(id, { ...data });
  if (typeof req.file != "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    Listing.image = { filename, url };
    await Listing.save();
  }

  await Listing.save();

  req.flash('success', 'Listing Updated');
  res.redirect(`/listings/${id}`);
};

module.exports.DeletePage = async (req, res) => {
  const { id } = req.params;
  await listing.findByIdAndDelete(id);
  req.flash('success', 'List is Deleted');
  res.redirect(`/listings`);
};

module.exports.RenderShowPage = async (req, res) => {
  const { id } = req.params;
  const list = await listing.findById(id)
    .populate({ path: 'reviews', populate: { path: 'owner' } })
    .populate('owner');

  if (!list) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  if (!list.image || !list.image.url) {
    list.image = {
      url: 'https://via.placeholder.com/600x400?text=No+Image+Available',
      filename: 'default.jpg'
    };
  }

  res.render('listings/show.ejs', { list });
};
