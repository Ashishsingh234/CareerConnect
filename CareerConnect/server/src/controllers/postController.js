const mongoose = require('mongoose');

async function createPost(req, res) {
  const Post = mongoose.model('Post');
  const { content, imageFileId } = req.body;
  if (!content && !imageFileId) return res.status(400).json({ message: 'Content or image required' });
  const post = await Post.create({ author: req.user._id, content, imageFileId });
  const p = await post.populate({ path: 'author', select: 'name role company' });
  // attach company name if author belongs to a company
  try {
    const Company = mongoose.model('Company');
    if (p.author && p.author.company) {
      const comp = await Company.findById(p.author.company).select('name').lean();
      if (comp) p.author.companyName = comp.name;
    }
  } catch (e) { /* ignore */ }
  res.json(p);
}

async function listPosts(req, res) {
  const Post = mongoose.model('Post');
  const User = mongoose.model('User');
  const { companyId } = req.query || {};

  let baseQuery = {};
  if (companyId) {
    // Find users that belong to this company and use them as authors
    try {
      const users = await User.find({ company: companyId }).select('_id').lean();
      const uids = users.map(u => u._id);
      baseQuery = { author: { $in: uids } };
    } catch (e) {
      console.error('Error finding company users for posts filter', e);
      baseQuery = { author: null }; // ensure no posts returned if error
    }
  }

  const posts = await Post.find(baseQuery).sort({ createdAt: -1 }).populate('author', 'name role company').populate('comments.author', 'name');

  // Attach imageUrl for post images and author/commenter profileImageUrl if available
  const CandidateProfile = mongoose.model('CandidateProfile');

  const withUrls = await Promise.all(posts.map(async p => {
    const obj = p.toObject();
    if (obj.imageFileId) obj.imageUrl = `/public-files/${obj.imageFileId}`;

    // author profile image (protected files)
    try {
      const profile = await CandidateProfile.findOne({ user: obj.author._id });
      if (profile?.profileImageId) obj.author.profileImageUrl = `/files/${profile.profileImageId}`;
      // If the author is a company user, attach the company logo (public)
      if (!obj.author.profileImageUrl && obj.author.company) {
        try {
          const Company = mongoose.model('Company');
          const comp = await Company.findById(obj.author.company).select('logoFileId').lean();
          if (comp && comp.logoFileId) obj.author.companyLogoUrl = `/public-files/${comp.logoFileId}`;
        } catch (e) { /* ignore */ }
      }
      // Also attach company name for display
      if (obj.author.company) {
        try {
          const Company = mongoose.model('Company');
          const comp2 = await Company.findById(obj.author.company).select('name').lean();
          if (comp2) obj.author.companyName = comp2.name;
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }

    // comments author profile images (protected files)
    if (obj.comments && obj.comments.length) {
      for (const c of obj.comments) {
        try {
          const pprofile = await CandidateProfile.findOne({ user: c.author });
          if (pprofile?.profileImageId) c.authorProfileImageUrl = `/files/${pprofile.profileImageId}`;
          else {
            // If commenter is a company user (unlikely) try company logo
            const User = mongoose.model('User');
            const u = await User.findById(c.author).select('company role').lean();
            if (u && (u.role === 'company' || u.role === 'hr') && u.company) {
              const Company = mongoose.model('Company');
              const comp = await Company.findById(u.company).select('logoFileId').lean();
              if (comp && comp.logoFileId) c.authorProfileImageUrl = `/public-files/${comp.logoFileId}`;
            }
          }
        } catch (e) { /* ignore */ }
      }
    }

    return obj;
  }));

  res.json(withUrls);
}

async function toggleLike(req, res) {
  const Post = mongoose.model('Post');
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const userId = req.user._id;
  const idx = post.likes.findIndex(l => String(l) === String(userId));
  if (idx === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(idx, 1);
  }
  await post.save();
  res.json({ likes: post.likes.length, liked: idx === -1 });
}

async function addComment(req, res) {
  const Post = mongoose.model('Post');
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text required' });
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push({ author: req.user._id, text });
  await post.save();
  const populated = await Post.findById(post._id).populate('comments.author', 'name');
  res.json(populated);
}

module.exports = { createPost, listPosts, toggleLike, addComment };
