const str2hex=(d='金')=>[...encodeURI(d).toLocaleLowerCase()].filter(x=>x!='%').join('')
const get_hash=()=>decodeURI(location.hash).replace('#','')


function bihua_mingcheng(seq=0) {
    //  var bishun = [ "撇", "捺", "横", "横", "竖", "点", "撇", "横" ]
    //  var after_bishun = bishun.slice(seq)
    //  var before_bihua = bishun.slice(0,seq)
    console.log(seq) //变色

}

const hanzi_html5_frame=(ctx, frame, size)=>{

  ctx.fillStyle = 'white';
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'lightgray';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeRect(0, 0, size, size);
  ctx.fillStyle = 'lightgray';


  ctx.moveTo(0, 0);
  ctx.lineTo(size, size);
  ctx.moveTo(size, 0);
  ctx.lineTo(0, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  for (line in frame) {
    bihua_data = frame[line];
    ctx.beginPath();
    for (dot in bihua_data) {

       // let [x,y]=bihua_data[dot].map(z=>z* size / 760)
        x = bihua_data[dot][0] * size / 760;
        y = bihua_data[dot][1] * size / 760;

        if (dot == 0) {
            ctx.moveTo(x, y)
        }else{
        ctx.lineTo(x, y)
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke()
  }

  ctx.beginPath();
  ctx.closePath();
  ctx.stroke()

}

hanzi_html5_fill=(ctx, frame, fill, fill_x, fill_y, size)=>{

 // console.log(fill_x,fill_y,fill.length)

  if (fill_x >= fill.length) {
    window.t1=setTimeout(function () {
      hanzi_html5_redraw(ctx, frame, fill, size)
    }, 1000); //每个字重绘间隔
    return
  }

  console.log(fill_x)
  //bihua_mingcheng(fill_x); //第几笔?

  next_y = Math.min(fill[fill_x].length, fill_y + 40);
  old_fill_y = fill_y;
  fill_y = next_y;
  for (step = old_fill_y; step < next_y; step++) {

        x = fill[fill_x][step][0] * size / 760;
        y = fill[fill_x][step][1] * size / 760;
        if (step == old_fill_y)
        ctx.moveTo(x, y);
         else
        ctx.lineTo(x, y)
  }
  ctx.stroke();

  if (fill_y >= fill[fill_x].length) {
        fill_x += 1;
        fill_y = 0;
        window.t2=setTimeout(function () {
          hanzi_html5_fill(ctx, frame, fill, fill_x, fill_y, size)
        }, 400) //每笔
  }else {
        window.t2=setTimeout(function () {
            hanzi_html5_fill(ctx, frame, fill, fill_x, fill_y, size)
         }, 100) //每个点
  }

}

hanzi_html5_redraw=(ctx, frame, fill, size)=>{

      hanzi_html5_frame(ctx, frame, size);
      hanzi_html5_frame(ctx, frame, size);

      var fill_x = 0;
      var fill_y = 0;

      ctx.lineWidth = 3*size/200 //3;
      ctx.strokeStyle = '#4cd964';
      ctx.fillStyle = '#4cd964';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      window.t0=setTimeout(function () {
            hanzi_html5_fill(ctx, frame, fill, fill_x, fill_y, size)
      }, 500)
}

const get=async (u,d={})=>{
    let r=await superagent
        .get(u)
        .query(d)
        .type('json')
    let dd=JSON.parse(r.text)
    return dd
}


const query=async (z="金")=>{
    let d0=await localforage.getItem(z)
    if (d0){
        return d0
    }
    let hex=str2hex(z)
    let u="/data/json/"+hex+".json"
    let r=await get(u)
    localforage.setItem(z,r)
    return r
}

const query_list=async()=>{
   let k="dict"
   let d0=await localforage.getItem(k)
   if (d0) {
        return d0
   }
   let r=await get('/data/list.json')
   localforage.setItem(k,r)
   return r
}




const stop=()=>{
    window.t0 && clearTimeout(t0)
    window.t1 && clearTimeout(t1)
    window.t2 && clearTimeout(t2)
}

const write=async(z="金")=>{
    stop()

    document.title=z
    location.hash="#"+z

    let dd=await query(z)
    const {
        bihua_jiegou="",
        bihua_mingcheng='',
        bihuashu=8,
        bushou="",
        fill,//[]8 []29
        frame,//[]8
        gif=null,
        not_pinyin,
        obushou="",
        pinyin='',
        word='',
    }=dd
    let id="zi"
    //size=260
    let canvas = document.getElementById(id);
    let size=canvas.width || 500
    var ctx = canvas.getContext('2d');
    hanzi_html5_redraw(ctx,frame,fill,size)
}

init=async ()=>{
    // let z=get_hash()
    let z="一"
    write(z)
    let dict=await query_list()
    window.dict=dict

    app=new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data(){
            return {
                current:0,
                dict:dict,
                kk:R.keys(dict),
            }
      },
      methods:{
          stop,
          change(d=1){
              let d1=this.current+d
              if (d1>0 && d1 < this.kk.length) {

              }else{
                  d1=0
              }
              this.current=d1
              write(this.kk[d1])
          },
      }
    })
}



init()

