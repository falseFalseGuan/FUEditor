(function(){
	/*
	以下的注释用来给编辑器提供参数。格式为：
		gparam或mparam 名字 控件信息
	gparam代表全局参数，mparam代表材质参数。
	控件信息是用JSON写的，一共有三大类控件：
		{"type":"edit"}：字符串参数用的编辑框，可以用"default_value"提供默认值
		{"type":"texture"}：贴图参数用的按钮，可以用"default_value"提供默认值
		{"type":"slider"}：数值参数用的条儿，可以用"default_value"提供默认值，"min"和"max"提供最小/最大值
	参数名称其实是可以用中文的，但是改了参数名的话原先调的值就没了，所以最好还是用“代码状”的名字比较好，
	一旦写定就不要随便改，宁可在旁边加注释。
	*/
	//物体名，别忘了设哦～ 千万别忘了设哦～～ 如果设成了"unnamed"可是会打警告的哦～～～
	//@#gparam name {"type":"edit","default_value":"unnamed"}
	//环境图
	//@gparam tex_light_probe {"type":"texture","default_value":"beach_1_4.jpg"}
	//环境图的旋转角度
	//@gparam envmap_shift {"type":"slider","min":0,"max":1,"default_value":0.75}
	//环境图的视角
	//@gparam envmap_fov {"type":"slider","min":0.5,"max":5,"default_value":1.0}
	//道具整体缩放的比例，用对数调节是为了方便
	//@gparam log_scale {"type":"slider","min":-5,"max":5,"default_value":0}
	//眼球左右旋转的倍率
	//@gparam eyeRscale {"type":"slider","min":0.0,"max":3.0,"default_value":1.5}
	///////////////////////////
	/*
	以下是光源参数。出于节省起见，现在只用了两个光。主光L0负责主要的照明，补光L1把侧面补亮。只有主光会产生高光。
	将来有需求的话可以把shader里L2的注释去掉，加个背光什么的。
	现在的光源都没有产生阴影。有需求请联系我们，在系统里加一下。
	*/
	//主光的航向角，也就是左右转的那个角
	//@gparam L0_yaw {"type":"slider","min":0,"max":1,"default_value":0}
	//主光的俯仰角，也就是上下转的那个角
	//@gparam L0_pitch {"type":"slider","min":-1,"max":1,"default_value":0}
	//主光的颜色，三个通道
	//@gparam L0_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_B {"type":"slider","min":0,"max":1,"default_value":1}
	//主光的强度，用对数调还是为了方便
	//@gparam L0Intensity {"type":"slider","min":-4,"max":4,"default_value":0}
	//补光的参数，和主光一样的。再次重申，补光不产生高光。
	//@gparam L1_yaw {"type":"slider","min":-0.5,"max":0.5,"default_value":0}
	//@gparam L1_pitch {"type":"slider","min":-1,"max":1,"default_value":0}
	//@gparam L1_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1Intensity {"type":"slider","min":-4,"max":4,"default_value":-2}
	//半透明算法阈值，设为1.0适合普通简单的半透明物体，设为0.5适合头发
	//@gparam alphaThreshold {"type":"edit","default_value":"1.0"}
	//是否固定位置,不跟随人脸运动，固定位置如下fixed_x/y/z
	//@gparam is_fixpos {"type":"slider","min":0,"max":1,"default_value":0}
	//在没有人脸的时候的固定位置
	//@gparam fixed_x {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_y {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_z {"type":"slider","min":0,"max":3000,"default_value":350}
	//在没有人脸的时候是否绘制
	//@gparam isnofacerender {"type":"slider","min":0,"max":1,"default_value":0}
	//控制旋转的幅度，rot_weight=1完全按照人头旋转，rot_weight=0不跟人头旋转
	//@gparam rot_weight {"type":"slider","min":0,"max":1,"default_value":1}
	///////////////////////////
	//以下是材质参数
	/*物体的类型,一是镂空,[0,0.25]；
				二是会完全随着脑袋旋转和缩放,(0.25,0.5]；
				三是权重控制旋转的幅度（前提是有对应主obj的weight.png,例如aa.obj对应的权重贴图是aa_weight.png）,(0.5,0.75]；
				四是只会跟着脑袋位移变化和大小的缩放，例如身体(0.75,1]。
	*/
	//@mparam obj_type {"type":"slider","min":0,"max":1,"default_value":0.3}
	
	//法向贴图，就是蓝了吧唧的那种，不是bump map哦～bump map要先转一下哦～～ 默认的grey.png等于没有贴图
	//@mparam tex_normal {"type":"texture","default_value":"grey.png"}
	//法向贴图的强度，为了照顾没有法向贴图的模型，强度默认是0，所以设了法向贴图之后要把强度拽高点才能看到效果
	//@mparam normal_strength {"type":"slider","min":0,"max":1,"default_value":0}
	//颜色贴图，默认的white.png是白的。建议先弄好贴图再去调光哦。
	//@mparam tex_albedo {"type":"texture","default_value":"white.png","isTex":1}
	//自发光强度
	//@mparam Ka {"type":"slider","min":0,"max":1,"default_value":0}
	//漫反射强度
	//@mparam Kd {"type":"slider","min":0,"max":1,"default_value":0.3}
	//高光强度，注意高光不受颜色贴图影响
	//@mparam Ks {"type":"slider","min":0,"max":1,"default_value":0.2}
	//环境图反射强度
	//@mparam Kr {"type":"slider","min":0,"max":1,"default_value":0.0}
	//表面粗糙度。越大高光越分散，越小高光越集中
	//@mparam roughness {"type":"slider","min":0.02,"max":1,"default_value":0.5}
	//高光强度贴图，应为灰度图，越大表示越亮。
	//@mparam tex_smoothness {"type":"texture","default_value":"grey.png"}
	//高光强度贴图的整体强度（有些拗口……），为了照顾到大多数没有高光强度贴图的模型，默认是0。设了贴图之后要把强度拽高哦～
	//@mparam has_tex_smoothness {"type":"slider","min":0,"max":1,"default_value":0}
	//环境图反射的折射率。折射率越小，反射从正面到边光的亮度变化越明显，整体强度越小。
	//@mparam ior {"type":"slider","min":1.01,"max":2.00,"default_value":1.33}
	//高光的金属度。越高越接近金属，越低越接近塑料。
	//@mparam F0 {"type":"slider","min":0,"max":1,"default_value":1.0}
	//这个材质是不是眼睛的标记
	//@mparam is_eye {"type":"slider","min":0,"max":1,"default_value":0}
	//这个材质是不是头发的标记
	//@mparam is_hair {"type":"slider","min":0,"max":1,"default_value":0}
	
	
	/*
	编辑器保存的结果会存放在"globals.json"和"materials.json"两个文件中。
	但在保存之前这两个文件是不存在的，所以要考虑到ReadFromCurrentItem失败的情况。
	"globals.json"直接就是把所有的全局参数放一起的一个对象：
		{
			"参数名":"值",
			……
		}
	"materials.json"的结构是：
		{
			"材质名":{
				"参数名":"值",
				……
			},
			"材质名":{
				……
			},
			……
		}
	"材质名"和blendshape.drawcalls[i].name是一一对应的。
	*/
	/////////////////////////util
	isActionTriggered=function (actionname, params){
		if(params.expression==undefined || params.rotation==undefined)return false;
		switch (actionname){
			//#action
			default:
				return false;
				break;
		}
	};
	quaterionSlerp=function(p,q,t){
		var sum = 0;
		for(var i =0;i<4;i++)sum+=p[i]*q[i];
		var theta = Math.acos(sum);
		var ws = Math.sin(theta);
		var w1 = Math.sin((1.0 - t)*theta)/ws;
		var w2 = Math.sin(t * theta)/ws;
		var qret = new Array();
		sum = 0;
		for(var i =0; i < 4; i++){
			qret[i] = w1 * p[i] + w2 * q[i];
			sum += qret[i] * qret[i];
		}
		sum = Math.sqrt(sum);
		for(var i =0; i < 4; i++)qret[i]/=sum;
		return qret;
	}
	//////////////////////////////
	var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
	var materials_json=JSON.parse(FaceUnity.ReadFromCurrentItem("materials.json")||"{}");
	//下面是正常的三维道具绘制流程
	var blendshape=FaceUnity.LoadBlendshape("avatar.json","avatar.bin");
	var s_vert_shader=FaceUnity.ReadFromCurrentItem("3d_vert.glsl");
	var s_frag_shader=FaceUnity.ReadFromCurrentItem("3d_frag.glsl");
	
	var bigtexjson = JSON.parse(FaceUnity.ReadFromCurrentItem("3d_bigtex_desc.json")||"{}");
	var bigtexcnt = 0;
	var bigtex = new Array();
	if(bigtexjson["bigtexs"]!=undefined){
		for(var i=0;i<bigtexjson["bigtexs"].length;i++){
			bigtex[bigtexcnt] = FaceUnity.LoadTexture(bigtexjson["bigtexs"][i],0);
			bigtexcnt++;
		}
	}
	console.log("bigtexcnt",bigtexcnt);
	now = Date.now();
	var expression=[]; for(var i=0; i<46; i++) expression.push(0);
	var focal_length = 303.64581298828125;
	//背景动画
	//var bg_board=JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	//var tex_bg=FaceUnity.LoadTexture("bg.jpg");
	//var tex_joker = FaceUnity.LoadTexture("joker.png");
	/*
	从这里开始开始涉及到编辑器中需要操作的参数。为了加快编辑速度，需要在script.js中提供动态重载的接口，
	所以这里在初始化时并没有设置参数值，而是抽象出了一个ReloadThingsForEditor函数供编辑器随时调用。
	*/
	var g_params={
		is3DFlipH: 0.0,
		weightOffset:[0.0,0.0,0.0],
	};
	var faces = [];
	var tex_map={};
	var SCALE = 1;
	var tex_light_probe;
	var L0_dir,L1_dir,L0_color,L1_color;
	//接下来是一些工具函数
	/**
	* \brief 给每个参数提供默认值的辅助函数。注意注释里的"default_value"只在UI上起作用，现在真的默认值还得在JS里再写一次。
	* \param v0 参数值
	* \param v1 默认值
	*/
	var V=function(v0,v1){
		return v0==undefined?v1:v0;
	};
	/**
	* \brief 根据欧拉角计算方向向量的辅助函数。用来帮助调节光源方向
	* \param yaw 航向角
	* \param pitch 俯仰角
	*/
	var CreateDirection=function(yaw,pitch){
		yaw*=2.0*3.1415926;
		pitch*=0.5*3.1415926;
		return [Math.cos(pitch)*Math.sin(yaw),-Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
	};
	/**
	* \brief 把颜色三通道和对数光强搞在一起的辅助函数
	* \param R 红色
	* \param G 绿色
	* \param B 蓝色
	* \param log_intensity 对数光强
	*/
	var CreateColor=function(R,G,B,log_intensity){
		var L=Math.exp(log_intensity);
		return [L*R,L*G,L*B]
	};
	/// \brief 提供给编辑器，用来重新初始化参数的函数
	var ReloadThingsForEditor=function(){
		//基本就是一通乱算，把适合图形界面调节的参数转化为适合shader使用的参数
		SCALE=Math.exp(V(globals.log_scale,0));
		L0_dir=CreateDirection(V(globals.L0_yaw,0),V(globals.L0_pitch,0));
		L1_dir=CreateDirection(V(globals.L1_yaw,0),V(globals.L1_pitch,0));
		L0_color=CreateColor(V(globals.L0_R,1),V(globals.L0_G,1),V(globals.L0_B,1), V(globals.L0Intensity,0));
		L1_color=CreateColor(V(globals.L1_R,1),V(globals.L1_G,1),V(globals.L1_B,1), V(globals.L1Intensity,-2));
		//编辑器在改了贴图之后会自动把文件转换成webp拷贝到工作区里，但是并不会帮着调LoadTexture，所以这里要调一下
		tex_light_probe=FaceUnity.LoadTexture(V(globals.tex_light_probe,"beach_1_4.jpg"),0,gl.CLAMP_TO_EDGE);
		//因为用户可能什么参数都没设……obj导出的贴图也还是load一下吧
		blendshape.drawcalls.forEach(function(dc){
			if(dc.mat.tex&&!tex_map[dc.mat.tex]){
				tex_map[dc.mat.tex]=FaceUnity.LoadTexture(dc.mat.tex);
			}
		});
		//对每个物体
		for(var sname in materials_json){
			//看一下是不是改过材质
			var mat=materials_json[sname];
			if(typeof(mat)=='object'){
				//然后在材质参数里面找tex_开头看着像贴图的
				for(var skey in mat){
					if(skey.match(/^tex_.*/)){
						//如果没有load过，就不管三七二十一load一下再说
						var fn=mat[skey];
						if(!tex_map[fn]){
							tex_map[fn]=FaceUnity.LoadTexture(fn);
						}
					}
				}
			}
		}
	};
	//就算在没有编辑器的时候，总也还是要初始化一次的
	ReloadThingsForEditor();
	//背景不动
	var bg_board={
		"type":"billboard_ex2",
		"base_vertex":-1,
		"enable_depth_test":1,
		//"shader":FaceUnity.ReadFromCurrentItem("bg.glsl"),
	};
	
	var AnimCounter={
		names:{},
		count:0,
		total:0,
		finish:function(name){
			if(this.names[name])return;
			this.names[name] = 1;
			this.count++;
		},
		hasFinish:function(){
			console.log("3d finish cnt",this.count);
			return this.count >= 1 ? 1:0;
		},
		allFinish:function(){
			console.log("3d finish cnt",this.count);
			return (this.count >= this.total && this.total!=0) ? 1 : 0;
		}
	}
	
	deepCopy =function(p, c){
		var c = c || {};
　　　　for (var i in p) {
　　　　　　if (typeof p[i] === 'object') {
　　　　　　　　c[i] = (p[i].constructor === Array) ? [] : {};
　　　　　　　　deepCopy(p[i], c[i]);
　　　　　　} else {
　　　　　　　　　c[i] = p[i];
　　　　　　}
　　　　}
　　　　return c;
　　}

	var Mesh = function(dc,anim){
		deepCopy(dc,this);
		deepCopy(anim,this);
		this.itemtype=3;
		if(this.betriggered==undefined)this.isActive = true;
		this.has_tex_albedo_frames = true;
		if(this.tex_albedo_frames==undefined){
			this.tex_albedo_frames = [{}];
			this.has_tex_albedo_frames = false;
		}
		this.isFinished = 0;
	}
	Mesh.prototype.switchState = function(lst,now){
		if(this.betriggered || this.isFinished)return;
		if(lst==0 && now==1){
			if(this.triggerstart=="newface")this.isActive = true;
		}
		if(lst==1 && now==0){
			if(this.triggerstart=="alwaysrender")this.isActive = true;
		}
	}
	Mesh.prototype.stopThis = function(now){
		console.log("stopThis:",this.name);
		if(!this.triggered)return;
		this.triggered =0;
		this.frame_id = 0;
		this.last = now;
		this.activateNext();
		if(this.triggerstart=="newface"||this.triggerstart=="alwaysrender"){
			this.isActive = false;
		}	
		if(this.isactiveonce==1){
			this.isFinished=1;
			AnimCounter.finish(this.name);
		}
	}
	Mesh.prototype.stop = function(now){
		this.stopThis(now);
	}
	Mesh.prototype.activateNext = function(){
		if(this.triggerNextNodesRef==undefined || this.triggerNextNodesRef.length==0)return;
		for(var idx in this.triggerNextNodesRef){
			if(this.triggerNextNodesRef[idx].isFinished==0){
				this.triggerNextNodesRef[idx].isActive=true;
			}
		}
	}
	Mesh.prototype.triggerThis=function(now){
		if(this.isFinished==1)return;
		this.triggered = 1;
		this.frame_id = 0;
		this.last = now;
		this.isActive = true;
		console.log("thriggerThis3d",this.name);
	}
	Mesh.prototype.triggerStartEvent=function(params,now,isNoneFace){
		if(this.triggered || !this.isActive)return;
		if((!isNoneFace && (this.triggerstart=="newface" || (this.triggerstart=="faceaction" && isActionTriggered(this.startaction,params))))
			||(isNoneFace && this.triggerstart=="alwaysrender")){		 
				this.triggerThis(now);
		}
	}
	Mesh.prototype.updateEvent = function(params,now){
		var matex=(materials_json[this.name]||{});
		
		var rotation = params.rotation.slice();
		if(V(globals.rot_weight,1.0) < 0.05){
			rotation = [0,0,0,1];
		}else if(V(globals.rot_weight,1.0) < 0.95){
			rotation = quaterionSlerp([0,0,0,1], rotation, V(globals.rot_weight,1.0));
		}
		
		var mat=FaceUnity.CreateViewMatrix(
			[-rotation[0],-rotation[1],-rotation[2],rotation[3]],
			params.translation);
		var mat_cam=FaceUnity.CreateViewMatrix(
			[0,0,0,1],
			params.translation);
		if(V(matex.is_eye,this.is_eye)){
			mat=FaceUnity.MatrixMul(
				FaceUnity.CreateEyeMatrix(
					[this.P_center[0]*SCALE,this.P_center[1]*SCALE,-this.P_center[2]*SCALE],
					[params.pupil_pos[0]*V(globals.eyeRscale,1.5),params.pupil_pos[1]]),
				mat);
		}
		this.use_custom_gl_states=1;
		this.use_OIT_shader=1;

		if(V(matex.obj_type,0.3)>0.75){
			var center=[3.329,-90.223,-4.394];
			var mat2=FaceUnity.MatrixMul(
				[
					1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					center[0],center[1],center[2],1],
				mat
			);
			mat=FaceUnity.CreateViewMatrix(
				[0,0,0,1],
				[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]]);
		}
		this.rotation = rotation;
		this.mat = mat;
		this.mat_cam = mat_cam;
		if(this.triggered){
			var elapse = now - this.last;
			this.frame_id = parseInt(elapse * this.fps / 1000);
			if(this.force_frame_id!=undefined && this.force_frame_id>=0)this.frame_id = this.force_frame_id;
		}
	}
	Mesh.prototype.triggerEndEvent = function(params,now,isNoneFace){
		if(this.triggered!=1)return;
		if(!isNoneFace){
			if(this.triggerend=="newface"){
				this.stop(now);return;
			}
			if(/*action end*/this.triggerend=="faceaction" && isActionTriggered(this.endaction,params)){
				this.stop(now);
			}
			if(this.triggerstart=="alwaysrender")return;
			
			if(/*action keep*/this.triggerstart=="faceaction" && this.needkeepfaceaction== 1 && !isActionTriggered(this.startaction,params)){
				this.stop(now);
			}
		}else{
			if(this.triggerstart!="alwaysrender")return;
		}
		
		if(/*loop end*/this.looptype=="loopcnt" && ((this.frame_id +1) >= this.tex_albedo_frames.length * this.loopcnt)){
			this.stop(now);
		}
	}
	
	Mesh.prototype.renderEvent = function(params,pass,shader){
		if(!this.triggered || !this.isActive)return;
		var matex=(materials_json[this.name]||{});
		if(this.has_tex_albedo_frames==true){
			albedo = bigtex[this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].bigtexidx];
			lbrt = this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].lbrt;
		}else{
			albedo = tex_map[V(matex.tex_albedo,this.mat.tex)];
			lbrt = [0.0,0.0,1.0,1.0];
		}
		FaceUnity.RenderBlendshapeComponent_new(blendshape,this,s_vert_shader,shader,{
			scales:[this.scales[0]*SCALE,this.scales[1]*SCALE,-this.scales[2]*SCALE],
			mat_view:this.mat,
			mat_cam:this.mat_cam,
			quatR1:[this.rotation[0],this.rotation[1],this.rotation[2],this.rotation[3]],
			quatT1:[0,0,0],//[params.translation[0],params.translation[1],params.translation[2],1],
			quatR2:[0,0,0,1],
			quatT2:[0,0,0],//[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]],
			obj_type:V(matex.obj_type, 0.3),
			mat_proj:FaceUnity.CreateProjectionMatrix(),
			tex_albedo:albedo,
			lbrt:lbrt,
			tex_normal:tex_map[V(matex.tex_normal,"grey.png")],
			tex_smoothness:tex_map[V(matex.tex_smoothness,"grey.png")],
			normal_strength:V(matex.normal_strength,0.0),
			tex_light_probe:tex_light_probe,
			envmap_shift:V(globals.envmap_shift,0.75),
			envmap_fov:V(globals.envmap_fov,1.0),
			Ka:V(matex.Ka,0.0), Kd:V(matex.Kd,0.3), Ks:V(matex.Ks,0.2), Kr:V(matex.Kr,0.0),
			roughness:V(matex.roughness,0.5),
			has_tex_smoothness:V(matex.has_tex_smoothness,0.0),
			is_hair:pass>0,
			ior:V(matex.ior,1.33),
			F0:V(matex.F0,1.0),
			L0_dir:L0_dir,L0_color:L0_color,
			L1_dir:L1_dir,L1_color:L1_color,
			isFlipH:g_params['is3DFlipH'],
			weightOffset:g_params['weightOffset'],
			//L2_dir:[0.25,0,-1],L2_color:[2.0,2.0,2.0],
		},pass);
	}
	
	
	
	var last_state=0;
	var meshlst = new Array();
	AnimCounter.total=0;
	for(var i = 0;i<blendshape.drawcalls.length;i++){
		var nmesh = new Mesh(blendshape.drawcalls[i],materials_json[blendshape.drawcalls[i].name].anim);
		meshlst.push(nmesh);
		meshlst[nmesh.name]=nmesh;
		if(nmesh.isactiveonce)AnimCounter.total++;
	}
	var facehack_mesh_ref_lst; 
	var transparent_mesh_ref_lst; 
	var opaque_mesh_ref_lst;
	var reExtractSubLst = function(){
		facehack_mesh_ref_lst = meshlst.filter(function(mesh){return V((materials_json[mesh.name]||{}).obj_type,0)<=0.25;});
		transparent_mesh_ref_lst =  meshlst.filter(function(mesh){return V((materials_json[mesh.name]||{}).is_hair,0)>0.5;});
		opaque_mesh_ref_lst = meshlst.filter(function(mesh){
			return (V((materials_json[mesh.name]||{}).obj_type,0)>0.25)
				&& (V((materials_json[mesh.name]||{}).is_hair,0)<0.5);
		});
	}
	reExtractSubLst();
	/*
	for(var i = 0;i<facehack_mesh_ref_lst.length;i++){
		console.log("=========facehack:",facehack_mesh_ref_lst[i].name);
	}
	for(var i = 0;i<transparent_mesh_ref_lst.length;i++){
		console.log("+++++++++transparent:",transparent_mesh_ref_lst[i].name);
	}
	for(var i = 0;i<opaque_mesh_ref_lst.length;i++){
		console.log("#########opaque:",opaque_mesh_ref_lst[i].name);
	}
	*/
	var calTriggerNextNodesRef=function(meshlst_2d){
		for(var i = 0;i<meshlst.length;i++){
			var nmesh = meshlst[i];
			if(nmesh.triggerNextNodes.length!=0)nmesh.triggerNextNodesRef = new Array();
			for(var j = 0;j<nmesh.triggerNextNodes.length;j++){
				var mesh3dref = meshlst[nmesh.triggerNextNodes[j]];
				if(mesh3dref){nmesh.triggerNextNodesRef.push(mesh3dref);}
				else if(meshlst_2d){
					var mesh2dref = meshlst_2d[nmesh.triggerNextNodes[j]];
					if(mesh2dref){nmesh.triggerNextNodesRef.push(mesh2dref);}
				}
			}
		}
	}
	
	var DoRender = function(params,pass){
		try{
			//for tex animation
			now = Date.now();
			if(last_state==0){
				for(var i = 0; i < meshlst.length; i++)meshlst[i].switchState(last_state,1);
				last_state = 1;
			}
			var alphaThreshold = parseFloat(V(globals.alphaThreshold, "1.0"));
			var shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();return vec4(c.rgb,1.0);}";
			//update for all mesh
			meshlst.forEach(function(mesh){
				mesh.triggerStartEvent(params,now,false);
				mesh.updateEvent(params,now);
			});
			if(pass==1){
				FaceUnity.ComputeBlendshapeGeometry(blendshape,params);
				//for facehack
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.ZERO,gl.ONE);
				facehack_mesh_ref_lst.forEach(function(mesh){mesh.renderEvent(params,-1,shader);});
				gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
			
			}else if(pass ==2){
				//for opaque object
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				gl.depthMask(true);
				gl.disable(gl.BLEND);
				opaque_mesh_ref_lst.forEach(function(mesh){mesh.renderEvent(params,0,shader);});
				
				//for transport object, alpha cut pass one
				gl.enable(gl.DEPTH_TEST);
				gl.depthMask(true);
				shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a>=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,1.0);else discard;}";
				transparent_mesh_ref_lst.forEach(function(mesh){mesh.renderEvent(params,1,shader);});
				
				//for transport object, alpha cut pass two
				gl.enable(gl.DEPTH_TEST);
				gl.depthMask(false);
				gl.enable(gl.BLEND);
				gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ZERO);
				shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a<=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,c.a*" + (1.0/alphaThreshold).toFixed(3) + ");else return vec4(c.rgb,0.0);}";
				transparent_mesh_ref_lst.forEach(function(mesh){mesh.renderEvent(params,2,shader);});
						
				gl.depthMask(true);
				gl.disable(gl.DEPTH_TEST);
				
				meshlst.forEach(function(mesh){mesh.triggerEndEvent(params,now,false);});
			}
		}catch(err){
			console.log(err.stack)
		}
	}

	console.log("3d AnimCounter.total",AnimCounter.total);
	return {
		CalRef:calTriggerNextNodesRef,
		meshlst:meshlst,
		animCounter:AnimCounter,
		//接下来就是道具对象的内容了
		/// \brief 处理编辑器发起的参数修改
		SetParam:function(name,value){
			//特殊参数名'@refresh'表示“刷新一下”
			if(name=='@refresh'){
				ReloadThingsForEditor();
				return 1;
			}
			if(name=='is3DFlipH'){
				g_params[name] = value;
				return 1;
			}
			if(name=="weightOffset"){
				g_params[name]=value;
				return 1;
			}
			/*
			否则的话，name里面就是一个JSON对象：{"name":"材质名或<global>"，"param":"参数名"}
			接着就是根据不同情况找到参数的位置设上值。考虑到每个部分都可能写错，处理一下异常会安全一些。
			有特殊需求的话，可以在这里进行一定的合法性检查。
			*/
			try{
				var desc;
				try{
					desc=JSON.parse(name);
				}catch(err){console.log("non json 3d param");return undefined;}
				if(desc.thing=="<global>"){
					globals[desc.param]=value;
					if (desc.param=="alphaThreshold"){
						blendshape.drawcalls.forEach(function(dc){
							dc.shader_hash_0=undefined;
							dc.shader_hash_1=undefined;
							dc.shader_hash_2=undefined;
						});
					}
					return 1;
				}else{
					var dc=materials_json[desc.thing];
					if(!dc){
						console.log("3d mesh not found");
						return undefined;
					}
					dc[desc.param]=value;
					if(desc.param=="obj_type" || desc.param=="is_hair")reExtractSubLst();
					return 1;
				}
			}catch(err){console.log(err.stack);}
			return undefined;
		},
		/// \brief 给编辑器提供用来在界面上显示的参数值，或者将需要保存的东西返回给编辑器
		GetParam:function(name){
			//前面两个是保存用的
			if(name=="hasFinish")return AnimCounter.hasFinish();
			if(name=="allFinish")return AnimCounter.allFinish();
			if(name=='@global_json'){
				return JSON.stringify(globals,null,2);
			}
			if(name=='@materials_json'){
				return JSON.stringify(materials_json,null,2);
			}
			/*
			编辑器本身并不会记忆修改的参数值，而是每次都会过来取。
			如果编辑器上什么东西怎么拽都不动弹的话，那么多半就是这个文件里什么地方写错了。
			*/
			try{
				var desc=JSON.parse(name);
				if(desc.thing=="<global>"){
					return globals[desc.param];
				}else{
					var dc=materials_json[desc.thing];
					if(dc){
						return dc[desc.param];
					}
				}
			}catch(err){console.log(err.stack);}
			return undefined;
		},
		/// \brief 主要的绘制逻辑
		Render:function(params,pass){
			if(V(globals.is_fixpos,0)>0.5){
				params.translation = [V(globals.fixed_x,0),V(globals.fixed_y,0),V(globals.fixed_z,350),1];
			}
			if(!params.focal_length)params.focal_length = focal_length;
			DoRender(params,pass);
		},
		RenderNonFace:function(params,pass){
			////fixed section
			if(params.face_count>0) return;
			if(last_state==1 && !params.face_count){
				for(var i = 0; i < meshlst.length; i++)meshlst[i].switchState(last_state,0);
				last_state = 0;
			}
			try{
				if(V(globals.isnofacerender,0)>0.5){
					params.translation = [V(globals.fixed_x,0),V(globals.fixed_y,0),V(globals.fixed_z,350),1];
					params.rotation=[0,0,0,1];
					params.pupil_pos=[0,0];
					params.expression=expression;
					if(!params.focal_length)params.focal_length = focal_length;
					DoRender(params,pass);
				}
			}catch(err){
				console.log(err.stack);
			}
		},
		name:V(globals.name,"dummy"),
	};
})()