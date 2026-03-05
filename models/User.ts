import mongoose, { Schema, model, models } from 'mongoose'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: string
  subscriptionStatus: string
  subscriptionExpiryDate?: Date
  subscriptionPlan?: string
  setupAccess: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    subscriptionStatus: {
      type: String,
      default: 'inactive',
    },
    subscriptionExpiryDate: Date,
    subscriptionPlan: String,
    setupAccess: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  {
    timestamps: true,
  }
)

const User = models.User || model<IUser>('User', UserSchema)

export default User
