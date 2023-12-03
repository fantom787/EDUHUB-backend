import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Enter Your Course Title"],
    minLenght: [4, "Tile must be Atleast 4 Charecters"],
    minLenght: [80, "Tile cant exceed 80 Charecters"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Your Course Description"],
    minLenght: [20, "Description must be Atleast 20 Charecters"],
  },
  lectures: [
    {
      title: {
        type: String,
        required: [true, "Please Enter Your Course Title"],
      },
      description: {
        type: String,
        required: [true, "Please Enter Your Course Description"],
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Enter Course Creator name"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Course = mongoose.model("Course", Schema);
