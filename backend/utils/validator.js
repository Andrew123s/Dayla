const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(6).max(128).required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      }),
    bio: Joi.string().max(500).optional(),
    interests: Joi.array().items(
      Joi.string().trim().max(50)
    ).max(10).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional(),
    interests: Joi.array().items(
      Joi.string().trim().max(50)
    ).max(10).optional(),
    location: Joi.string().max(100).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
  })
};

// Trip/Dashboard validation schemas
const tripSchemas = {
  createTrip: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    dates: Joi.object({
      startDate: Joi.string().optional(),
      endDate: Joi.string().optional()
    }).optional()
  }),

  updateTrip: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    dates: Joi.object({
      startDate: Joi.string().optional(),
      endDate: Joi.string().optional()
    }).optional(),
    category: Joi.string().valid(
      'hiking', 'business', 'family', 'camping', 'exploring', 'beach', 'road_trip', 'cultural', 'other'
    ).optional(),
    status: Joi.string().valid(
      'planning', 'booked', 'in_progress', 'completed', 'cancelled'
    ).optional(),
    destination: Joi.object({
      name: Joi.string().max(200).optional(),
      coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional()
      }).optional()
    }).optional(),
    coverImage: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublic: Joi.boolean().optional()
  }),

  createStickyNote: Joi.object({
    type: Joi.string().valid(
      'text', 'image', 'voice', 'weather', 'schedule', 'budget', 'sustainability'
    ).required(),
    x: Joi.number().min(0).required(),
    y: Joi.number().min(0).required(),
    width: Joi.number().min(60).max(800).required(),
    height: Joi.number().min(60).max(600).required(),
    content: Joi.string().max(10000).required(),
    color: Joi.string().optional(),
    emoji: Joi.string().max(10).optional(),
    linkTo: Joi.string().optional(),
    scheduledDate: Joi.string().optional()
  }),

  updateStickyNote: Joi.object({
    x: Joi.number().min(0).optional(),
    y: Joi.number().min(0).optional(),
    width: Joi.number().min(60).max(800).optional(),
    height: Joi.number().min(60).max(600).optional(),
    content: Joi.string().max(10000).optional(),
    color: Joi.string().optional(),
    emoji: Joi.string().max(10).optional(),
    linkTo: Joi.string().optional(),
    scheduledDate: Joi.string().optional()
  })
};

// Chat/Message validation schemas
const chatSchemas = {
  createConversation: Joi.object({
    name: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    isGroup: Joi.boolean().default(false),
    participants: Joi.array().items(Joi.string()).default([]) // Creator will be added automatically
  }),

  sendMessage: Joi.object({
    conversationId: Joi.string().required(),
    content: Joi.string().max(5000).when('messageType', {
      is: 'text',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    messageType: Joi.string().valid('text', 'image', 'video', 'audio', 'document', 'gif', 'sticker').default('text'),
    replyTo: Joi.string().optional(),
    attachments: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('image', 'video', 'audio', 'document', 'gif', 'sticker').required(),
        url: Joi.string().uri().required(),
        filename: Joi.string().required(),
        size: Joi.number().positive().required()
      })
    ).max(10).optional()
  }),

  addReaction: Joi.object({
    emoji: Joi.string().max(10).required()
  })
};

// Community/Post validation schemas
const communitySchemas = {
  createPost: Joi.object({
    title: Joi.string().max(200).allow('', null).optional(),
    content: Joi.string().min(1).max(5000).required().messages({
      'string.empty': 'Content cannot be empty',
      'string.min': 'Content must be at least 1 character',
      'any.required': 'Content is required'
    }),
    location: Joi.object({
      name: Joi.string().max(100).required().messages({
        'string.empty': 'Location name cannot be empty',
        'any.required': 'Location name is required'
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional()
      }).optional(),
      address: Joi.string().max(200).allow('', null).optional()
    }).required().messages({
      'any.required': 'Location is required',
      'object.base': 'Location must be a valid object with a name'
    }),
    tags: Joi.array().items(
      Joi.object({
        name: Joi.string().lowercase().trim().required(),
        category: Joi.string().valid(
          'activity', 'location', 'season', 'difficulty', 'duration'
        ).required()
      })
    ).max(10).default([]),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().max(200).allow('', null).optional(),
        alt: Joi.string().max(100).allow('', null).optional()
      })
    ).max(10).default([]),
    visibility: Joi.string().valid('public', 'friends', 'private').default('public'),
    tripId: Joi.string().allow('', null).optional()
  }),

  updatePost: Joi.object({
    title: Joi.string().max(200).optional(),
    content: Joi.string().max(5000).optional(),
    location: Joi.object({
      name: Joi.string().max(100).optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional()
      }).optional(),
      address: Joi.string().max(200).optional()
    }).optional(),
    tags: Joi.array().items(
      Joi.object({
        name: Joi.string().lowercase().trim().required(),
        category: Joi.string().valid(
          'activity', 'location', 'season', 'difficulty', 'duration'
        ).required()
      })
    ).max(10).optional(),
    visibility: Joi.string().valid('public', 'friends', 'private').optional()
  }),

  addComment: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    replyTo: Joi.string().optional()
  }),

  addLike: Joi.object({
    // No additional fields needed
  })
};

// Board/Collaboration validation schemas
const boardSchemas = {
  inviteUser: Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('viewer', 'editor', 'admin').default('editor')
  }),

  updateActivity: Joi.object({
    currentNote: Joi.string().optional(),
    cursorPosition: Joi.object({
      x: Joi.number().optional(),
      y: Joi.number().optional()
    }).optional()
  }),

  updateBoardSettings: Joi.object({
    backgroundColor: Joi.string().optional(),
    gridSize: Joi.number().min(10).max(50).optional(),
    snapToGrid: Joi.boolean().optional(),
    showLinks: Joi.boolean().optional()
  })
};

// File upload validation
const uploadSchemas = {
  imageUpload: Joi.object({
    // File validation is handled by multer
    caption: Joi.string().max(200).optional(),
    alt: Joi.string().max(100).optional()
  }),

  documentUpload: Joi.object({
    // File validation is handled by multer
    title: Joi.string().max(200).optional(),
    description: Joi.string().max(500).optional()
  }),

  audioUpload: Joi.object({
    // File validation is handled by multer
    title: Joi.string().max(200).optional(),
    transcription: Joi.string().optional()
  })
};

// General validation helper
const validate = (schema, data, options = {}) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context.value
    }));

    return {
      isValid: false,
      errors,
      value: null
    };
  }

  return {
    isValid: true,
    errors: [],
    value
  };
};

// Export all schemas and validation function
module.exports = {
  userSchemas,
  tripSchemas,
  chatSchemas,
  communitySchemas,
  boardSchemas,
  uploadSchemas,
  validate
};
