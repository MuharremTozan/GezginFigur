import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async findOrCreateGithubUser(profile: any): Promise<UserDocument> {
    const { id, username, displayName, photos } = profile;
    const avatarUrl = photos && photos[0] ? photos[0].value : '';

    let user = await this.userModel.findOne({ githubId: id });
    const adminUsername = this.configService.get<string>('GITHUB_ADMIN_USERNAME');
    const role = username.toLowerCase() === adminUsername?.toLowerCase() ? 'admin' : 'user';

    if (!user) {
      user = new this.userModel({
        githubId: id,
        username,
        displayName: displayName || username,
        avatarUrl,
        role,
      });
      await user.save();
    } else {
      // Keep profile info and role updated
      user.displayName = displayName || username;
      user.avatarUrl = avatarUrl;
      user.role = role;
      await user.save();
    }

    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}
