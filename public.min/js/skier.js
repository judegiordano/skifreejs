export default class Skier{constructor(i){this.game=i,this.maxSpeed=600,this.enforceMaxSpeed=!0,this.skateV=225,this.accelX=2,this.accelY=3,this.decel=-2.75,this.decelCrash=-4,this.jumpVInit=.7,this.jumpGravity=.01,this.hitbox={x:2,y:24,width:10,height:2},this.images=[]}init(){this.x=this.game.gameWidth/2,this.y=this.game.gameHeight/3,this.currentImage=this.skier_left,this.currentJumpImage=this.skier_jump_left,this.jumpStage=1,this.isSkatingLeft=!1,this.isSkatingRight=!1,this.xv=0,this.yv=0,this.jumpOffset=0,this.jumpV=0,this.currentSpeed=0,this.isStopped=!0,this.isCrashed=!1,this.isJumping=!1,this.backflipsCompleted=0,this.isDoingTrick1=!1,this.trick1StartTime=null,this.trick1EndTime=null,this.trick1Disabled=!1,this.isDoingTrick2=!1,this.trick2Times=0}loadAssets(){this.skier_left=this.game.util.loadImage("/img/skier_left.png",this),this.skier_left_down=this.game.util.loadImage("/img/skier_left_down.png",this),this.skier_down_left=this.game.util.loadImage("/img/skier_down_left.png",this),this.skier_down=this.game.util.loadImage("/img/skier_down.png",this),this.skier_down_right=this.game.util.loadImage("/img/skier_down_right.png",this),this.skier_right_down=this.game.util.loadImage("/img/skier_right_down.png",this),this.skier_right=this.game.util.loadImage("/img/skier_right.png",this),this.skier_jump_down=this.game.util.loadImage("/img/skier_jump_down.png",this),this.skier_jump_left=this.game.util.loadImage("/img/skier_jump_left.png",this),this.skier_jump_right=this.game.util.loadImage("/img/skier_jump_right.png",this),this.skier_falling=this.game.util.loadImage("/img/skier_falling.png",this),this.skier_sit=this.game.util.loadImage("/img/skier_sit.png",this),this.skier_skate_left=this.game.util.loadImage("/img/skier_skate_left.png",this),this.skier_skate_right=this.game.util.loadImage("/img/skier_skate_right.png",this),this.skier_upside_down1=this.game.util.loadImage("/img/skier_upside_down1.png",this),this.skier_upside_down2=this.game.util.loadImage("/img/skier_upside_down2.png",this),this.skier_trick1_left=this.game.util.loadImage("/img/skier_trick1_left.png",this),this.skier_trick1_right=this.game.util.loadImage("/img/skier_trick1_right.png",this),this.skier_trick2=this.game.util.loadImage("/img/skier_trick2.png",this)}update(i){this.currentSpeed=Math.sqrt(Math.pow(this.xv,2)+Math.pow(this.yv,2));let t=i[0],s=i[1],e=i[2];if(t<90&&t>-5||-90==t)this.isJumping?this.determineJumpImage(this.skier_jump_left,t):this.isSkatingLeft&&!this.isCrashed?(this.currentImage=this.skier_skate_left,this.xv=-this.skateV,this.isStopped=!1):this.isSkatingRight&&!this.isCrashed?(this.currentImage=this.skier_skate_right,this.xv=this.skateV,this.isStopped=!1):(this.currentImage=this.skier_left,this.decelerateToStop(e));else if(t<-175||t>90&&t<180)this.isJumping?this.determineJumpImage(this.skier_jump_right,t):this.isSkatingLeft&&!this.isCrashed?(this.currentImage=this.skier_skate_left,this.xv=-this.skateV,this.isStopped=!1):this.isSkatingRight&&!this.isCrashed?(this.currentImage=this.skier_skate_right,this.xv=this.skateV,this.isStopped=!1):(this.currentImage=this.skier_right,this.decelerateToStop(e));else{t<-5&&t>-50?this.isJumping?this.determineJumpImage(this.skier_jump_left,t):this.currentImage=this.skier_left_down:t<-50&&t>-75?this.isJumping?this.determineJumpImage(this.skier_jump_left,t):this.currentImage=this.skier_down_left:t<-75&&t>-105||90==t?this.isJumping?this.determineJumpImage(this.skier_jump_down,t):this.currentImage=this.skier_down:t<-105&&t>-130?this.isJumping?this.determineJumpImage(this.skier_jump_right,t):this.currentImage=this.skier_down_right:t<-130&&t>-175&&(this.isJumping?this.determineJumpImage(this.skier_jump_right,t):this.currentImage=this.skier_right_down),this.isStopped||(this.isSkatingLeft=!1,this.isSkatingRight=!1);let i=1;t>-90&&t<0&&(i=-1);let e=this.maxSpeed*s[0]*i*.75,h=this.maxSpeed*s[1];this.isJumping?(e=this.maxSpeedXBeforeJump,h=this.maxSpeedYBeforeJump):(this.maxSpeedXBeforeJump=e,this.maxSpeedYBeforeJump=h,this.isCrashed||(this.isStopped=!1,this.xv+=this.accelX*s[0],this.yv+=this.accelY*s[1])),this.enforceMaxSpeed&&(this.xv<-e?this.xv=-e:this.xv>e&&(this.xv=e),this.yv>h&&(this.yv=h))}if(this.isJumping&&(this.jumpOffset+=this.jumpV,this.jumpV-=this.jumpGravity,this.jumpOffset<=0)){if((1!=this.jumpStage||this.isDoingTrick1||this.isDoingTrick2)&&(this.isCrashed=!0,this.game.style=0,this.trick1StartTime=null,this.trick1EndTime=null,this.trick2Times=0),!this.isCrashed){if(this.game.style+=this.game.stylePointsToAwardOnLanding,this.game.style+=20*this.backflipsCompleted,null!=this.trick1StartTime&&null!=this.trick1EndTime){let i=this.trick1EndTime-this.trick1StartTime,t=Math.floor(i/80+5);this.game.style+=t,this.trick1StartTime=null,this.trick1EndTime=null}this.game.style+=10*this.trick2Times}this.jumpOffset=0,this.game.stylePointsToAwardOnLanding=0,this.backflipsCompleted=0,this.didTrick2=!1,this.isJumping=!1,this.isDoingTrick1=!1,this.trick2Times=0,this.trick1Disabled=!1,this.jumpStage=1}this.isCrashed&&(this.currentImage=this.skier_falling,this.isJumping||this.decelerateToStop(e),this.isStopped&&(this.currentImage=this.skier_sit,this.xv=0,this.yv=0))}decelerateToStop(i){if(!this.isStopped&&!this.isJumping){let t=this.decel*i[0],s=this.decel*i[1];this.isCrashed&&(t=this.decelCrash*i[0],s=this.decelCrash*i[1]),this.xv-=t,this.yv-=s,this.yv<=0&&(this.yv=0,this.xv=0,this.isStopped=!0)}}rotateJumpStage(){this.jumpStage<3?this.jumpStage++:(this.jumpStage=1,this.backflipsCompleted++)}determineJumpImage(i,t){switch(this.jumpStage){case 1:this.isDoingTrick1?(this.currentImage=t>=-90&&t<90?this.skier_trick1_left:this.skier_trick1_right,this.isDoingTrick2=!1):(t>20&&t<160&&90!=t||-90==t)&&!this.isStopped?(this.currentImage=this.skier_trick2,this.isDoingTrick2||(this.isDoingTrick2=!0,this.trick2Times++)):(this.currentImage=i,this.isDoingTrick2=!1);break;case 2:this.currentImage=this.skier_upside_down1,this.isDoingTrick2=!1;break;case 3:this.currentImage=this.skier_upside_down2,this.isDoingTrick2=!1}}draw(i){let t=0;switch(this.currentImage){case this.skier_left:t=-4;break;case this.skier_left_down:t=-2;break;case this.skier_down_left:t=-1;break;case this.skier_right_down:t=-5;break;case this.skier_right:t=-4;break;case this.skier_sit:t=-8;break;case this.skier_jump_down:t=-6;break;case this.skier_falling:t=-9;break;case this.skier_jump_left:t=-7;break;case this.skier_jump_right:t=-6;break;case this.skier_upside_down1:t=-7;break;case this.skier_upside_down2:t=-8;break;case this.skier_trick1_left:t=-6;break;case this.skier_trick1_right:t=-4;break;case this.skier_trick2:t=-6}i.drawImage(this.currentImage,this.x+t,this.y-this.jumpOffset)}}