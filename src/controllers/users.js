import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { updateUser, getAllUsers } from '../services/users.js';
import createHttpError from 'http-errors';
// import { UsersGoogleCollection } from '../db/models/user.js';
import { generateAuthUrl, validateCode } from '../utils/googleOAuth2.js';

// export const createOrUpdateUser = async (userData) => {
//   const { googleId, fullName, email, picture } = userData;

//   let user = await UsersGoogleCollection.findOne({ googleId });

//   if (!user) {
//     user = await UsersGoogleCollection.create({ googleId, fullName, email, picture });
//   } else {
//     user.fullName = fullName;
//     user.picture = picture;
//     await user.save();
//   }

//   return user;
// };

// export const getGoogleAuthUrl = (req, res) => {
//   try {
//     const url = generateAuthUrl();
//     res.status(200).json({ data: { url } });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const googleAuthCallback = async (req, res) => {
//   const { code } = req.query;

//   try {
//     const ticket = await validateCode(code);
//     const payload = ticket.getPayload();

//     const user = {
//       fullName: `${payload.given_name} ${payload.family_name}`,
//       email: payload.email,
//       picture: payload.picture,
//     };

//     // Реалізація створення токену для користувача
//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(401).json({ message: error.message });
//   }
// };

// export const getCurrentUser = async (req, res) => {
//   const user = await UsersGoogleCollection.findById(req.session.userId);

//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   res.json({
//     fullName: user.fullName,
//     email: user.email,
//     picture: user.picture,
//   });
// };

export const patchUserController = async (req, res, next) => {
  const userId = req.user._id;
  const photo = req.file;
  const user = req.body;
  let photoUrl;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateUser({
    userId,
    user,
    photo: photoUrl,
  });

  if (!result) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully updated user!`,
    data: result.user,
  });
};
export const getUserByIdController = async (req, res, next) => {
  const user = req.user;
  const userId = user._id;
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found user with id ${userId}!`,
    data: user,
  });
};

export const getAllUsersController = async (req, res) => {
  const usersCount = await getAllUsers();

  res.json({
    status: 200,
    message: 'Successfully found the amount of users!',
    usersAmount: usersCount,
  });
};
