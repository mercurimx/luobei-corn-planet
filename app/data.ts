export type ZoneId = "luobei" | "soil" | "weather" | "field" | "harvest" | "transport" | "processing";
export type DestinyId = "feed" | "starch" | "oil" | "food";

export type Zone = {
  id: ZoneId;
  name: string;
  number: string;
  icon: string;
  eyebrow: string;
  prompt: string;
  cardTitle: string;
  poetic: string;
  fact: string;
  quote: string;
  source: string;
  scene: string;
  card: string;
  position: { left: string; top: string };
};

export const zones: Zone[] = [
  { id:"luobei", name:"萝北坐标", number:"01", icon:"⌖", eyebrow:"地图的东北角", prompt:"点亮地图上的发光坐标", cardTitle:"风记得萝北", poetic:"在地图辽阔的东北角，一粒玉米把自己的名字别在了风上：萝北。", fact:"萝北县隶属黑龙江省鹤岗市，位于黑龙江省东北部、小兴安岭南麓与三江平原交汇处，东北以黑龙江为界与俄罗斯隔江相望。", quote:"原来我不是走丢了，我是刚把老家想起来。", source:"萝北县人民政府发布的自然地理环境概况。", scene:"assets/scene-luobei.webp", card:"assets/card-01.webp", position:{left:"24%",top:"29%"}},
  { id:"soil", name:"黑土地", number:"02", icon:"⌁", eyebrow:"春天从黑暗里醒来", prompt:"向上拖动土层，唤醒地下的根", cardTitle:"黑土记忆", poetic:"许多春天，都是从黑暗里开始的。", fact:"东北黑土具有较好的保水保肥能力，是玉米、大豆和水稻等作物的重要土壤资源；保护黑土也是保护持续生产粮食的能力。", quote:"别看这儿黑，春天可都在里头攒着呢。", source:"自然资源部门黑土地科普；黑龙江省自然资源厅萝北县黑土地保护信息。", scene:"assets/scene-soil.webp", card:"assets/card-02.webp", position:{left:"48%",top:"30%"}},
  { id:"weather", name:"天气", number:"03", icon:"☁", eyebrow:"风有自己的消息", prompt:"碰一碰云层，看看秋天的脾气", cardTitle:"秋天的脾气", poetic:"这里的秋天不爱提前打招呼，风一来，温度就跟着收拾行李。", fact:"萝北属中温带大陆性季风气候，四季差异明显；春季多风且降水偏少，秋季降温较快，并可能出现霜冻天气。", quote:"刚才还挺暖和，咋说降温就降温呢？", source:"萝北县人民政府发布的自然地理环境概况。", scene:"assets/scene-weather.webp", card:"assets/card-03.webp", position:{left:"70%",top:"31%"}},
  { id:"field", name:"玉米田", number:"04", icon:"♧", eyebrow:"青纱帐长高了", prompt:"和田里的小邻居聊一句", cardTitle:"青纱帐长高了", poetic:"我把夏天一节一节举高，最后举成一片会沙沙说话的森林。", fact:"玉米生长并不只发生在地面：幼苗期根系持续建立，进入后续阶段后，光照、水分、养分和田间管理共同影响植株生长。", quote:"我小时候也就这么大——行吧，我现在也没多大。", source:"农业农村部门玉米栽培科普信息；正式上线前结合萝北实际种植方式复核。", scene:"assets/scene-field.webp", card:"assets/card-04.webp", position:{left:"76%",top:"57%"}},
  { id:"harvest", name:"农机收获", number:"05", icon:"▰", eyebrow:"秋天踩下油门", prompt:"长按启动，让收割机驶过田野", cardTitle:"秋天踩下油门", poetic:"收割机一开口，田野就开始把金黄装进口袋。", fact:"机械化收获需要根据成熟程度、地块条件和籽粒含水率选择适宜时期与机型，并及时调整机具，以减少损失和破碎。", quote:"这大铁家伙嗓门不小，干活倒是真利索。", source:"农业农村部《玉米机械化收获减损技术指导意见》。", scene:"assets/scene-harvest.webp", card:"assets/card-05.webp", position:{left:"60%",top:"75%"}},
  { id:"transport", name:"粮仓运输", number:"06", icon:"♜", eyebrow:"秋天准备远行", prompt:"选一条路，把秋天送向远方", cardTitle:"秋天车站", poetic:"粮仓替大地保管秋天，车轮再把秋天送去更远的地方。", fact:"收获后的玉米如果水分未达到安全贮存要求，需要及时晾晒或烘干；合适的干燥和仓储条件有助于减少霉变、破碎和产后损失。", quote:"先住仓库，还是坐车出发？我这行程还挺满。", source:"农业农村部玉米机械化收获、烘干及贮存技术指导。", scene:"assets/scene-transport.webp", card:"assets/card-06.webp", position:{left:"34%",top:"77%"}},
  { id:"processing", name:"加工生活", number:"07", icon:"✦", eyebrow:"命运有四个方向", prompt:"选择一种去向，没有标准答案", cardTitle:"命运卡", poetic:"每一粒种子，都可以用不同的方式抵达人间。", fact:"玉米可以进入饲料、淀粉、玉米油和食品等加工利用方向。萝北本地的具体产业路径仍需结合调研材料核实。", quote:"这次我自己选。", source:"具体产业事实与来源待正式调研后补充。", scene:"assets/scene-processing.webp", card:"assets/card-07.webp", position:{left:"18%",top:"58%"}},
];

export const destinies = [
  {id:"feed" as DestinyId,name:"饲料",title:"把阳光继续养大",poetic:"我去养大另一个生命，让那年夏天的阳光换一种方式继续长。",fact:"玉米籽粒和部分玉米副产物可以进入饲料利用环节。萝北玉米是否以这一形式进入具体企业或地区，需要结合调研资料确认。",quote:"行，那我换个方式接着长。",card:"assets/card-07.webp"},
  {id:"starch" as DestinyId,name:"淀粉",title:"一场白色变身",poetic:"把金黄轻轻拆开以后，我成了一场细白而安静的雪。",fact:"玉米是淀粉加工的原料之一，玉米淀粉还可以继续进入食品及其他加工环节。萝北本地具体路径需结合调研资料确认。",quote:"这变身跨度是不是有点大？",card:"assets/card-08.webp"},
  {id:"oil" as DestinyId,name:"玉米油",title:"一滴金色的灯",poetic:"藏在胚芽里的秋光，被慢慢变成一盏会流动的小灯。",fact:"玉米胚芽可以作为玉米油加工的原料。萝北玉米是否进入这一具体路径，需结合当地企业和调研材料确认。",quote:"没想到吧，我身体里还藏着光呢。",card:"assets/card-09.webp"},
  {id:"food" as DestinyId,name:"食品",title:"抵达一顿热饭",poetic:"我决定离人间近一点——最好近到一张餐桌、一顿热饭。",fact:"玉米可以通过主食制品、方便食品及其他食品加工形式进入日常饮食；网站中出现的具体产品应依据调研素材选择。",quote:"这回不绕远了，我直接去饭桌。",card:"assets/card-10.webp"},
];
