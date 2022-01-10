const router = require('express').Router();
const {Post, User, Vote, Comment} = require('../../models');
const { sequelize } = require('../../models/Post');
const withAuth = require('../../utils/auth');

// get all posts
router.get('/', (req, res) => {
    console.log('=======================')
    Post.findAll({
      attributes: [
          'id', 
          'post_url', 
          'title', 
          'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id= vote.post_id)'),'vote_count']
      ],
      order:[['created_at','DESC']],
      include: [
          {
              model:Comment,
              attributes: ['id','comment_text','user_id','post_id'],
              include:{
                  model:User,
                  attributes:['username']
              }
          },
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => res.json(dbPostData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });
//get a single post
router.get('/:id',(req,res)=>{

    Post.findOne({
        where:{
            id:req.params.id
        },
        attributes:[
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_ud)'),'vote_count']
        ],
        include:[
            {
                model:Comment,
                attributes:['id','comment_text','post_id','user_id','created_at'],
                include:{
                    model:User,
                    attributes:['username']
                }
            },
            {
                model:User,
                attributes:['username']
            }
        ]
    })
    .then(updatedPostData=>{
        if(!updatedPostData){
            res.status(404).json({message:'No post found with this id'});
            return;
        }
        res.json(updatedPostData);
    })
    .catch(err=>{
        console.log(err);
        res.status(400).json(err)
    })
})

//create a post
router.post('/',withAuth,(req,res)=>{
    //expects {title:'Taskmaster goes public!',post_url:'https://taskmaster.com/press',user_id:1}
    Post.create({
        title: req.body.title,
        post_url:req.body.post_url,
        user_id: req.session.user_id
    })
    .then(dbPostData=>res.json(dbPostData))
    .catch(err=>{
        console.log(err);
        res.status(500).json(err)
    })
})
//put /api/posts/upvote this has be put before '/;id' otherwise express thinks this is a parameter.
router.put('/upvote',withAuth,(req,res)=>{
    //make sure session exists first
    if(req.session){
        //pass session id along with all destructured properties on req.body
        Post.upvote({...req.body,user_id:req.session.user_id},{Vote,Comment,User})
        .then(updatedVoteData=>res.json(updatedVoteData))
        .catch(err=>{
            console.log(err);
            res.status(500).json(err)
        })
    }
})

// update a post's title
router.put('/:id',withAuth,(req,res)=>{
    Post.update(
        {
            title:req.body.title
        },
        {where: {
            id: req.params.id
            }
        }
    )
    .then(dbPostData=>{
        if(!dbPostData){
            res.status(404).json({message:"No post found with this id"});
            return;
        }
        res.json(dbPostData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    })
})

router.delete('/:id',withAuth,(req,res)=>{
    Post.destroy({
        where:{
            id:req.params.id
        }
    })
    .then(dbPostData=>{
        if(!dbPostData){
            res.status(404).json({message:'No post found with this id'});
            return;
        }
        res.json(dbPostData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    })
})


module.exports= router;