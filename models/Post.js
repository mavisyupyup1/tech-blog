const {Model, DataTypes} = require('sequelize');
const sequelize = require("../config/connection");

//create out Post model
class Post extends Model{
    // using keyword static to indicate that upvote method is based on Post model abd not an instance method like User model. now we can use Post.upvote() as if were a built in function.
    static upvote(body,models){
        return models.Vote.create({
            user_id:body.user_id,
            post_id:body.post_id
        }).then(()=>{
            return Post.findOne({
                where:{
                    id:body.post_id
                },
                attributes:[
                    'id',
                    'post_url',
                    'title',
                    'created_at',
                    [
                        sequelize.literal('(SELECT COUNT (*) FROM vote WHERE post.id = vote.post_id)'),'vote_count'
                    ]
                ],
                include:[
                  {
                    model:models.Comment,
                    attributes:[
                      'id','comment_text','post_id','user_id','created_at'
                    ],
                    include:{
                      model:models.User,
                      attributes:['username']
                    }
                  }
                ]
            });
        });
    }
};
// define columns in post and pass current connection instance to initialize the Post model
Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    post_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isURL: true
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'post'
  }
);

module.exports = Post;