//#Current
(function () {
	var g_items = [];
	var item2ds;
	var item3ds;
	var require=function(fn){
		var jsstr = FaceUnity.ReadFromCurrentItem(fn);
		if(jsstr == undefined){
			console.log(fn,"is not exist");
			return undefined;
		}
		console.log("eval",fn,'begin');
		return eval(jsstr);
	};
	var itemname = "dummy";
	try{
	    item2ds = require("2d_script.js");
		item3ds = require("3d_script.js");
		
		if(item3ds!=undefined){
			g_items.push(item3ds);
			itemname = item3ds.name;
		}
		if(item2ds!=undefined){
			g_items.push(item2ds);
			itemname = item2ds.name;
		}
		if(item2ds && item2ds.CalRef && item3ds && item3ds.meshlst)item2ds.CalRef(item3ds.meshlst);
		if (item3ds && item3ds.CalRef && item2ds && item2ds.meshlst) item3ds.CalRef(item2ds.meshlst);
	}catch(err){
		console.log(err.stack);
	}
	console.log("itemname",itemname);
	var faces=[];
	var g_params={
		isMultiMask: 0,
	};
	return {
		SetParam:function(name,value){
		    try {
				if(name=="isMultiMask"){
					g_params[name] = value;
					return 1;
				}
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].SetParam(name,value);
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		GetParam:function(name){
			if(name=="allFinish"){
				var allf = 1;
				for(var i in g_items)allf&=g_items[i].animCounter.allFinish();
				return allf;
			};
			if(name=="hasFinish"){
				var hasf = 0;
				for(var i in g_items)hasf|=g_items[i].animCounter.hasFinish();
				console.log("hasFinish",hasf);
				return hasf;
			};
			for(var i in g_items){
				var ret = g_items[i].GetParam(name);
				if(ret!=undefined)return ret;
			}
			return undefined;
		},
		OnGeneralExtraDetector:function(){
			if(item2ds.OnGeneralExtraDetector)item2ds.OnGeneralExtraDetector();
		},
		FilterEntireImage:function(){
			if(item2ds.FilterEntireImage)item2ds.FilterEntireImage();
		},
		Render:function(params){
			try{
				if((FaceUnity.renderbillboardv||0)>3.0 && g_params.isMultiMask < 0.5){
					//this path when multi-people, 2d/ar ok ,3d ok
					if((params.face_ord < FaceUnity.m_n_valid_faces-1)){
						faces.push(params);
						return;
					}
					faces.push(params);
					for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
						params = faces[faceIndex];
						if(item3ds)item3ds.Render(params,1);//face hack
					}
					if(item2ds)item2ds.Render(params,1);//bg item
					for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
						params = faces[faceIndex];
						if(item3ds)item3ds.Render(params,2);
						if(item2ds)item2ds.Render(params,2);//non bg item
					}
					faces.splice(0,faces.length);
				}else{
					//this path when multi-people, 2d/ar ok ,3d fail
					if(item3ds)item3ds.Render(params,1);//face hack
					if(item2ds)item2ds.Render(params,1);//bg item
					if(item3ds)item3ds.Render(params,2);//3d item
					if(item2ds)item2ds.Render(params,2);//non bg item
				}
			}
			catch(err){
				console.log(err.stack);
			}
		},
		RenderNonFace:function(params){
			//for(var i in g_items)g_items[i].RenderNonFace(params);
			try{
				if(item3ds)item3ds.RenderNonFace(params,1);//face hack
				if(item2ds)item2ds.RenderNonFace(params,1);//bg item
				if(item3ds)item3ds.RenderNonFace(params,2);//3d item
				if(item2ds)item2ds.RenderNonFace(params,2);//non bg item
			}catch(err){
				console.log(err.stack);
			}
		},
		name:itemname,
	};
})()