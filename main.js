var canvas = document.querySelector('#canvas');
var a = canvas.getContext('2d');
var scoreDiv = document.querySelector('#score>span');
var loadingDiv = document.querySelector('#loading');
var menu = document.querySelector('#endMenu');
var totalScore = document.querySelector('#total>span');
var againBtn = document.querySelector('#restart');
//var a = new Image();
//a.src = 'resource/img/prop.png';
//导入图片
var imgArr = ['img/background.png','img/bomb.png','img/bullet1.png','img/bullet2.png','img/enemy1.png','img/enemy2.png','img/enemy3.png','img/herofly.png','img/loading.gif','img/prop.png'];

//记录已经加载的图片的数量
var loadedNum = 0;
//记录音频的数量
var audioNum = 0;
//定义一个音频对象的数组
var audioLists = [];

for(var i = 0; i < imgArr.length; i ++) {
	var img = new Image();
	img.src = imgArr[i];
	img.onload = function () {
		loadedNum ++;
		if(loadedNum == imgArr.length) {
			loadAudios(); //加载音频
		}
	}
}

function loadAudios() {
	var audioArr = ["audio/bullet.mp3","audio/enemy1_down.mp3","audio/enemy2_down.mp3","audio/enemy2_out.mp3","audio/enemy3_down.mp3","audio/game_music.mp3","audio/game_over.mp3"];
	for(var i = 0; i < audioArr.length; i ++) {
		var music = new Audio();
		music.src = audioArr[i];
		music.loop = true;
		music.volume = 0.8;
		audioLists.push(music);
		
		//当音频加载完毕时
		music.onloadedmetadata = function () {
			audioNum ++;
			if(audioNum == audioArr.length){
				//所有音频文件都加载完毕
				//让加载的动画隐藏
				loadingDiv.style.display = 'none';
				//播放游戏音效
				audioLists[5].play();
				//游戏开始
				main();
			}
		}
	}
}



/***************************************************************************************************/
// 游戏入口的主函数
function main () {
	//清除画布
	a.clearRect(0,0,canvas.width,canvas.height);
	//北京图移动
	background.move();
	//战机升空
	fighter.draw();
	
	//敌机,道具,出现 ;  子弹发射
	
	attack();
	
	
	
//	var b = new Bullet(fighter.x + fighter.w/2,fighter.y - 5,6,14,bullet1Img,30);
//	b.shoot();
//	
//	var e1 = new Enemy(100,200,38,34,enemy1Img,30,5,1,100,5);
//	e1.move();
//	
//	var e2 = new Enemy(200,100,46,64,enemy3Img,60,3,2,200,6);
//	e2.move();
//
//	var p =new Prop (100,0,39,68,0,5);
//	p.show();
	//北京图
	requestAnimationFrame(main);
}


/***********定义一系列的变量**********************/
//存储敌机的数组
var enemyArr = [];
//战机是否被摧毁
var fighterDown = false;
//子弹是否要清除
var clearBulluts = false;
//炸弹的大绝招是否可用
var isUseful;
//标识一下子弹的类型 0 : 默认单排子弹  1: 双发   2 :连发
var bulletType = 0;
// 子弹对象bullet;
var bullet;
//存储总分数
var sumScore = 0;
//空寂战机爆炸动画的时间
var time = 0;

//道具对象
var propObj;
//是否出现道具
var hasProp = false;

//双发道具使用时限
var remainTime = 300;

//连发道具使用时限
var validTime = 400;

//炸弹是否已经发射
var isFire = false;

//定义一个变量让敌机水平方向也改变位置
var verTime = 0;

//  敌机  道具出现  子弹发射
function attack() {
	// 随机敌机   道具的位置出现
	//敌机随机位置
	var x1 = randNum(0,canvas.width - 38	);// 小型敌机
	var x2 = randNum(0,canvas.width - 110);//大型敌机
	var x3 = randNum(0,canvas.width - 46);//中型敌机
	//道具随机位置
	var x4 = randNum(0,canvas.width- 39);//道具
	//随机敌机出现的概率
	var num = randNum(1,400);
	
	//随机道具的出现概率
	var prop1 = randNum(1,180)//炸弹大招
	var prop2= randNum(1,150)//双发大招
	var prop3 = randNum(1,180)//连发大招
	//随机速度
	var speed1 = randNum(3,8);
	var speed2 = randNum(1,5);
	var speed3 = randNum(2,7);
	//道具类型
	var propType = randNum(0,2);
	

	
	// 敌机来袭
	if(num < 9) {
	   // 小型敌机
	   var enemy1 = new Enemy(x1,-200,38,34,enemy1Img,50,speed1,1,100,5);
	   enemyArr.push(enemy1);
	   if(num < 2) {
		   	//大型敌机
		    var enemy2 = new Enemy(x2,-200,110,164,enemy2Img,500,speed2,2,500,10);
		    enemyArr.push(enemy2);
	   }
	   if(num < 6){
		    //中型敌机
		    var enemy3 = new Enemy(x3,-200,46,64,enemy3Img,150,speed3,3,200,6);
		    enemyArr.push(enemy3);
	   }
	}
	//遍历敌机数组和子弹数组  碰撞检测
	
	for(var i = 0; i < enemyArr.length; i ++) {
		//遍历一下子弹数组
		for(var j = 0; j < bullets.length; j ++) {
			//判断敌机是否被击中 若没有被击中 ,做正常的碰撞检测
			if(enemyArr[i].isHit == false) {
				if(isCrash(enemyArr[i],bullets[j])) {
					// 如果子弹击中敌机 敌机的生命值递减 (减去子弹的攻击力值) 
					enemyArr[i].hp -= bullets[j].hurts;
					// 当敌机生命值小于等于 0 的时候,代表被击毁
					if(enemyArr[i].hp <= 0) {
						// 敌机被炸毁
						enemyArr[i].boom();
					};
					// 子弹移除(从数组中删除该子弹)
					bullets.splice(j,1);
					
				}
			}
			
		};
		
		//战机和敌机是否相撞
		if(isCrash(enemyArr[i],fighter)) {
			// 战机被撞毁
			fighterDown = true;
			// 清除所有子弹
			clearBulluts = true;
			// 炸弹大招不再可用
			isUseful = false;
			//游戏结束语  播放结束音效   出现结束菜单
			audioLists[5].pause();//停止播放游戏音效
			audioLists[0].pause();//停止子弹音效
			audioLists[6].play();//播放结束音效
		};
		
		// 敌机正常飞过领空 ()
		// 超出范围的处理
		if(enemyArr[i].y > canvas.height) {
			// 敌机飞出领空,就将刺激从数组移除
			enemyArr.splice(i,1);
		};
		
		if(enemyArr[i]){
			// 移动
			enemyArr[i].move();
			//代表该架敌机已经被击毁
			if(enemyArr[i].isClear) {
				// 得分
                sumScore += enemyArr[i].score;
                // 清除该架敌机
                enemyArr.splice(i,1);
                // 循环变量递减  移除之后改变了原来的数组所以要减去一
                i --;
                
			}
		}
	}
	
	/********以上是遍历是否碰撞**********/
	
	//发射出现
	
//	var b = new Bullet(fighter.x + fighter.w/2,fighter.y - 5,6,14,bullet1Img,30);
//	b.shoot();
	//子弹未被清除时,代表此时战机还存活
	if(clearBulluts == false){
		// 判断子弹的类型
		switch(bulletType) {
			case 1 :
			// 双发子弹
			bullet = new Bullet(fighter.x + 9,fighter.y + 14,48,14,bullet2Img,60);
			break;
			case 2 :
			// 连发子弹
			bullet = new Bullet(fighter.x + 30,fighter.y,6,14,bullet1Img,50);
			break;
			default :
			// 默认的单排子弹
			bullet = new Bullet(fighter.x + fighter.w/2,fighter.y - 5,6,14,bullet1Img,30);
			break;
			
		}
		bullet.shoot();//发射子弹
	} else {
		//清除所有子弹
		bullets = [];
		//战机击毁的动画
        time ++;
        //控制动画时长执行
        if(time >= 10) {
        	   fighter.mx += fighter.w;
        	   time = 0;
        };
        //弹出结束菜单
        if(fighter.mx >= 330) {
        	  menu.style.display = 'block';
        	  totalScore.innerHTML = scoreDiv.innerHTML;
        }
        
	}
	
	// 出现道具
	//若没有出现道具时,随机概率出现任意一种道具
	if(prop1 < 5 && hasProp == false) {
		propObj = new Prop(x4,0,39,68,propType,speed1);
		//状态置反  表示已有道具出现
		hasProp = true;
	}
	//若出现道具
	if(hasProp) {
		//道具随机掉落
		propObj.show();
		//道具超出范围 没有获取到道具
		if(propObj.y > canvas.height) {
			hasProp = false;
		}
		// 道具与战机相撞并且战机还在存活的情况下  此时战机获取到该道具
		if(isCrash(propObj,fighter) && fighterDown == false) {
			switch(propObj.kind) {
				case 0:
				// 获取到炸弹
				isUseful = true;
				break;
				case 1:
				// 获取到双发
				bulletType = 1;
				break;
				case 2:
				// 获取到炸弹
				bulletType = 2;
				break;
			};
			//获取到该道具后,该道具消失
			hasProp = false;
		}
	}
	
	//获取的是炸弹道具
	if(isUseful == true){
		//右下角出现
		boom.draw()
	}
	//获取的是双发道具
	if(bulletType == 1) {
		remainTime --;
		if(remainTime < 0) {
			//恢复到默认单排子弹
			bulletType = 0;
			remainTime = 300;//重置初始值
		}
		interval = 10;//重置为初始值
	}
	//获取的是连发道具
	if(bulletType == 2) {
		//调整速度发射的速度
		interval = 1;
		validTime --;
		if(validTime < 0) {
			bulletType = 0;
			validTime = 300; //重置初始值
			interval = 10;
		}
	}
	
	/****发射炸弹大招开始******/
	   //pc端  点击空格发射大招
	   document.onkeydown = function (event) {
	   	 if(event.keyCode == 32) {
	   	 	//点击空格时, 如炸弹可用 发射炸弹
	   	 	if(isUseful) {
	   	 		isFire = true;
	   	 	}
	   	 }
	   }
	   
	    //为了兼容手机端应该有这个大招之后摇晃手机炸全屏
	    var current = {
				x : 0,
				y : 0,
				z : 0
			};
			//设备摇晃后,加速器的值
			var after = {
				x : 0,
				y : 0,
				z : 0
			}
			//设置定义摇晃的加速器的最小距离
			var min = 10;
			
			//当手机陀螺仪移动时触发,
			window.ondevicemotion = function (event) {
				//获取加速器(包含设备的坐标信息)
				var acceleration = event.accelerationIncludingGravity;
				
				//记录当前陀螺仪的值
				current.x = acceleration.x;
				current.y = acceleration.y;
				current.z = acceleration.z;
				//判断是否在晃动
				var bool = Math.abs(after.x - current.x) >= min ||Math.abs(after.y - current.y) >= min ||Math.abs(after.z - current.z) >= min; 
				if(bool && isUseful) {
			   	 		isFire = true;
				}
			}
	    
	    
	/***start******如果战机还没有被击落,并且炸弹大招可用  点击空格时  销毁所有敌机  ***/
	   if(fighterDown == false && isUseful == true && isFire == true) {
	   	for(var i = 0; i < enemyArr.length; i ++) {
	   		enemyArr[i].boom();
	   		//炸弹已使用  置反可用炸弹数减一
	   		isUseful = false; //炸弹已使用 状态置反
	   		isFire = false;// 已发射后 状态置反
	   	}
	   }
	   
	  
	/**end**发射炸弹大招结束**************************/
	
	/**********显示得分开始***************/
	  scoreDiv.innerHTML = sumScore;
	/**********显示得分开始***************/

}

/*********************重新开始按钮的设置start************/
againBtn.onclick = restart;
againBtn.addEventListener('touchstart',restart);
function restart() {
	location.reload();
}
/*********************重新开始按钮的设置end************/





/***************************************************************************************************/

//创建图片对象,方便使用
//背景图
var bgImg = new Image();
bgImg.src = 'img/background.png';

//战机图
var fightImg = new Image();
fightImg.src = 'img/herofly.png';

//子弹图
var bullet1Img = new Image(); //单发的子弹
bullet1Img.src = 'img/bullet1.png';
var bullet2Img = new Image();//双发的子弹
bullet2Img.src = 'img/bullet2.png';

//道具图
var propImg = new Image();
propImg.src = 'img/prop.png';
//💣
var boomImg = new Image();
boomImg.src = 'img/bomb.png';

//敌机图
var enemy1Img = new Image();//小型敌机
enemy1Img.src = 'img/enemy1.png';
var enemy2Img = new Image();// 大型的敌机
enemy2Img.src = 'img/enemy2.png';
var enemy3Img = new Image();//中型敌机
enemy3Img.src = 'img/enemy3.png';


//设置画布的宽高
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
var row = Math.ceil(canvas.height/568);
var col = Math.ceil(canvas.width/320);

// 背景图滚动的效果实现
var background = {
	x : 0 ,
	y : 0,
	w : canvas.width,
	h : canvas.height,
	//绘制
	draw : function () {
		//背景图满屏
		for(var i = -row;i < row; i ++) {
			for(var j = 0 ; j < col; j ++) {
				a.drawImage(bgImg,320*j,568*i + this.y);
			}
		}
	},
	//滚动
	scroll : function () {
		this.y ++;
		if(this.y >= row*568	){
			this.y = 0;
		}
	},
	//绘制并自动开始滚动
	move : function () {
		this.draw();
		this.scroll();
	}
}


/*************************/

//战机对象
var fighter = {
	x : canvas.width/2 - 33,
	y : canvas.height - 102,
	w : 66,
	h : 82,
	mx : 0,
	draw : function () {
	  a.drawImage(fightImg,this.mx,0,this.w,this.h,this.x,this.y,this.w,this.h);	
	}
	
}

/*************************/
//炸弹对象

var boom = {
	x : canvas.width - 42 - 20,
	y : canvas.height - 36 - 20,
	
	//当获取到炸弹道具时,出现在右下角
	draw : function () {
		a.drawImage(boomImg,this.x,this.y)
	}
}

/*************************/
//添加事件  战机移动
canvas.onmousedown = function (eve) {
	var e = eve || window.event;
	//获取鼠标所在的位置
	var x = e.clientX;
	var y = e.clientY;
	//若按下的位置是战机所在的范围  添加移动事件
	if(x > fighter.x && x < fighter.x + fighter.w && y > fighter.y && y < fighter.h + fighter.y) {
		canvas.onmousemove = function (eve) {
			var e = eve || window.event;
			var px = e.clientX;
			var py = e.clientY;
			// 战机随鼠标位置而移动
			fighter.x = px - 33;
			fighter.y = py - 41;
			return false;
		}
	};
}

// 鼠标抬起时取消绑定
window.onmouseup = function () {
	canvas.onmousemove = null;
}

// 添加移动端事件
canvas.addEventListener('touchstart',function (event) {
	//获取手指
	var aTouch = event.touches[0];
	//获取手指所在的位置
	var x = aTouch.pageX;
	var y = aTouch.pageY;
	if(x > fighter.x && x < fighter.x + fighter.w && y > fighter.y && y < fighter.h + fighter.y) {
		canvas.addEventListener('touchmove',flymove,false)
	}
	
	
},false);

//触屏移动事件的处理函数
function flymove(event) {
    var tx = event.touches[0].pageX;
    var ty = event.touches[0].pageY;
    fighter.x = tx - 33;
    fighter.y = ty - 41;
    event.preventDefault();
}

//触摸结束时,取消绑定
canvas.addEventListener('touchend',function (){
	canvas.removeEventListener('touchmove',flymove); 
});


/*************************/
//子弹类  构造函数
// 存储所有子弹的一个数组
var bullets = [];
//控制子弹的发射的频率,就是中间发射的时间间隔
var n = 0;
var interval = 10;
//位置  大小  绘制所用的图片 攻击力  
function Bullet(x,y,w,h,img,hurts) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img = img;
	this.hurts = hurts;
	//发射的移动的动画的方法
	this.shoot = function () {
		n += 2;
		//控制发射的频率或者叫做速度
		if(n >= interval) {
			// 创建子弹
			var aBullet = new Bullet(this.x,this.y,this.w,this.h,this.img,this.hurts);
			//存储到数组中
			bullets.push(aBullet);
			//播放子弹生效
			audioLists[0].play();
			//重置n
			n = 0;
		}
		// 遍历一下这个数组
		for(var i = 0; i < bullets.length; i ++){
			if(bullets[i]) {
				//若子弹存在,调整子弹的位置
				bullets[i].y -= 5;
				//绘制子弹
				a.drawImage(bullets[i].img,bullets[i].x,bullets[i].y);
			}
			//边界超出处理,子弹出界之后
			if(bullets[i] <= -bullets[i].h) {
				bullets.splice(i,1);
			}
		}
	};
	
}


/******************道具类*****构造函数***************/
//位置  大小  类型(0:炸弹道具 1 : 双发  2 : 连发子弹)  速度
function Prop (x,y,w,h,kind,speed) {
	this.x = x; 
	this.y = y;
	this.w = w;
	this.h = h;
	this.kind = kind;
	this.speed = speed;
	//道具图片的定位的位置
	this.mx = this.kind * this.w;
	//出现道具
	this.show = function () {
		this.y += this.speed;
		//绘制道具
		a.drawImage(propImg,this.mx,0,this.w,this.h,this.x,this.y,this.w,this.h);
	};
	
}

/******************敌机类*****构造函数***************/
//位置  大小  敌机的图片 生命值  敌机的速度  敌机的类型   敌机的分数  图片的帧数
//hp 代表生命值  小型敌机:50  大型敌机: 200; 中型敌机 100;
//敌机的类型type : 1代表小型敌机  2代表大型敌机  3代表中型敌机
//分数score 击毁不同敌机对应的分数 
function Enemy (x,y,w,h,img,hp,speed,type,score,frameNum) {
	this.x = x;
	this.y = y; 
	this.w = w;
	this.h = h;
	this.img = img;
	this.hp = hp;
	this.speed = speed;
	this.type = type;
	this.score = score;
	
	

	this.type = type;
	this.score = score;
//	this.frameNum = frameNum;
	//敌机图片的定位位置
	this.mx = 0;
	//子弹是否打中敌机的状态
	 this.isHit = false;
	 //表示是否要清除该敌机的属性
	 this.isClear = false;
	
	//敌机出现
	this.move = function () {
		
		//是否被击中
		if(!this.isHit) {
			//水平方向控制多久移动一次
//			verTime ++;
//			if(verTime >= 100) {
//				this.x += Math.floor(Math.random() * (50 + 50 + 1) - 50);
//				verTime = 0;
//			}
			//若未被击中
			this.y += this.speed;
			
		} else {
			//被击中  切换图片位置  产生被击中的动画
			this.mx += this.w;
			//被击毁的时候
			if(this.mx >= frameNum * this.w) {
				// 敌机应该被清除
				this.isClear = true;
			}
		};
		//绘制敌机
		a.drawImage(this.img,this.mx,0,this.w,this.h,this.x,this.y,this.w,this.h);
	};
	
	// 敌机爆炸
	this.boom = function () {
		// 改变状态
		this.isHit = true;
		//播放不同类型的敌机坠毁的音效
		switch (this.type) {
			case 1:
			//播放小型敌机坠毁的音效
			audioLists[1].play();
			break;
			case 2:
			//播放大型敌机坠毁的音效
			audioLists[2].play();
			break;
			case 3:
			//播放中型敌机坠毁的音效
			audioLists[4].play();
			break;
		}
	}
	
}

/*****随机数函数***********/
function randNum (x,y) {
	return Math.floor(Math.random() * (y - x + 1) + x);
}

/********** 碰撞检测函数******************/
function isCrash (obj1,obj2) {
	//做安全处理, 当两个对象都存在时,做检测
	if(obj1&&obj2) {
		var l1 = obj1.x;
		var r1 = l1 + obj1.w;
		var t1 = obj1.y;
		var b1 = t1 + obj1.h;
		var l2 = obj2.x;
		var r2 = l2 + obj2.w;
		var t2 = obj2.y;
		var b2 = t2 + obj2.h;
		if(l1 <= r2 && r1 >= l2 && t1 <= b2 && b1>= t2) {
			//代表相撞了
			return true;
		} else {
			//代表没有相撞
			return false;
		}
	}
}























