#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the editable two-traveler route from the agreed itinerary; times are estimates."""
import json
from pathlib import Path
from urllib.parse import urlencode
R=Path(__file__).resolve().parents[2]
P={
'BCN机场':('Barcelona El Prat Airport, Barcelona, Spain',41.2974,2.0833),
'哥特区':('Barcelona Cathedral, Barcelona, Spain',41.3839,2.1761),
'Born街区':('El Born Centre de Cultura, Barcelona, Spain',41.3849,2.1837),
'圣家堂':('Sagrada Familia, Barcelona, Spain',41.4035,2.1744),
'圣保罗医院':('Sant Pau Recinte Modernista, Barcelona, Spain',41.4140,2.1755),
'巴特罗之家':('Casa Batllo, Barcelona, Spain',41.3917,2.1649),
'Barcelona Sants':('Barcelona Sants railway station, Barcelona, Spain',41.3791,2.1403),
'Santa Justa':('Sevilla Santa Justa railway station, Seville, Spain',37.3925,-5.9758),
'西班牙广场':('Plaza de Espana, Seville, Spain',37.3772,-5.9869),
'新广场':('Plaza Nueva, Seville, Spain',37.3886,-5.9948),
'黄金塔':('Torre del Oro, Seville, Spain',37.3826,-5.9963),
'特里亚纳桥':('Puente de Isabel II, Seville, Spain',37.3857,-6.0047),
'都市阳伞':('Setas de Sevilla, Seville, Spain',37.3930,-5.9912),
'塞维利亚王宫':('Real Alcazar de Sevilla, Seville, Spain',37.3832,-5.9902),
'塞维利亚主教堂':('Catedral de Sevilla, Seville, Spain',37.3859,-5.9931),
'格拉纳达站':('Granada railway station, Granada, Spain',37.1837,-3.6086),
'格拉纳达大教堂':('Granada Cathedral, Granada, Spain',37.1766,-3.5991),
'圣尼古拉斯观景台':('Mirador de San Nicolas, Granada, Spain',37.1812,-3.5927),
'阿尔罕布拉宫':('Alhambra, Granada, Spain',37.1761,-3.5881)
}
def s(k):
 q,lat,lon=P[k];return {'name':k,'query':q,'lat':lat,'lon':lon}
def step(t,what,kind='free',note='',link=''):
 d={'t':t,'what':what,'kind':kind,'tag':'pinned' if kind in ('anchor','arrival') else 'skippable'}
 if note:d['note']=note
 if link:d['link']=link
 return d
def day(date,city,cid,label,ribbon,stops,timeline,late,rain,travel=False):
 d={'date':date,'city':city,'city_id':cid,'label':label,'ribbon':ribbon,'late_cut':late,'rain_alt':rain,'stops':[s(x) for x in stops], 'timeline':timeline,'walking_km':{'total':None,'how':'路线和馆内步行待导航核实'},'travel_day':travel}
 if len(stops)>1:
  same=not travel
  if same:
   coords=['{:.6f},{:.6f}'.format(P[x][1],P[x][2]) for x in stops]
   par={'api':1,'origin':coords[0],'destination':coords[-1],'travelmode':'walking'}
   if len(coords)>2:par['waypoints']='|'.join(coords[1:-1])
   d['day_map']='https://www.google.com/maps/dir/?'+urlencode(par)
 return d
D=[]
D.append(day('2026-12-29','Barcelona','barcelona','抵达巴塞罗那 · 老城初见','BCN 机场 → 寄存行李 → 哥特区 → Born',['BCN机场','哥特区','Born街区'],[step('08:05','抵达 BCN 机场，入境取行李','arrival'),step('上午','进城、寄存行李、午餐；休息后再出发','hop'),step('14:00–16:00','哥特区与大教堂外观','photo'),step('16:00–17:30','Born街区散步','free'),step('傍晚','晚餐与节日灯饰；疲劳就提前休息','meal')],'航班延误或睡眠不足则取消 Born 和海边。','下雨则改就近咖啡馆或已确认营业的室内地点。'))
D.append(day('2026-12-30','Barcelona','barcelona','圣家堂与高迪建筑','圣家堂 → 圣保罗医院 → 格拉西亚大道',['圣家堂','圣保罗医院','巴特罗之家'],[step('09:15','到圣家堂入口附近，按票面时间提前到场','hop'),step('10:00–12:00','圣家堂预约参观','anchor','时间仅作示例，以官方票面为准。','https://sagradafamilia.org/en/faqs'),step('12:15–13:15','沿高迪大道至圣保罗医院外观','photo'),step('13:15–14:30','附近午餐','meal'),step('15:00–17:00','巴特罗之家或米拉之家择一入内','anchor','需核实日期、门票与开放时间。'),step('晚间','老城节日灯饰与晚餐','free')],'延误时删除第二个室内建筑。','保留预约室内建筑，减少外围拍照。'))
D.append(day('2026-12-31','Barcelona → Seville','seville','前往塞维利亚 · 跨年夜','Barcelona Sants → Santa Justa → 跨年倒数',['Barcelona Sants','Santa Justa','西班牙广场','新广场'],[step('白天','Barcelona Sants 出发前往 Santa Justa；班次未核实','hop'),step('抵达后','寄存行李或入住；时间允许再去西班牙广场','lodging'),step('晚间','确认晚餐营业，之后可去新广场跨年','meal','往年地点来自旅游局；2026–27 活动未公布或未核实。'),step('午夜','按当地习俗体验十二颗葡萄','free')],'晚到则直接入住和用餐，取消广场。','下雨或人多可改在住处倒数。',True))
D.append(day('2027-01-01','Seville','seville','元旦 · 公园与河岸','西班牙广场 → 黄金塔 → 特里亚纳桥 → 都市阳伞',['西班牙广场','黄金塔','特里亚纳桥','都市阳伞'],[step('10:00–12:00','西班牙广场与 Maria Luisa 公园','photo'),step('12:00–13:30','午餐：先确认元旦营业','meal'),step('14:00–16:00','黄金塔外观、河岸与特里亚纳桥','free'),step('16:30–18:00','都市阳伞周边与晚餐','photo','上方观景营业待查；王宫元旦关闭。')],'删阳伞和较远河岸段。','取消河岸，改已确认营业的室内咖啡馆。'))
D.append(day('2027-01-02','Seville','seville','王宫与主教堂','塞维利亚王宫 → 主教堂/Giralda → Santa Cruz',['塞维利亚王宫','塞维利亚主教堂'],[step('09:00','前往王宫，预留安检时间','hop'),step('09:30–12:00','塞维利亚王宫和花园','anchor','依实际预约时段为准。','https://alcazarsevilla.org/prepara-la-visita/'),step('12:00–13:15','老城午餐','meal'),step('13:45–15:45','塞维利亚主教堂与 Giralda','anchor','官方现行一般参观先进入 Giralda；开放及礼拜时间须复核，不能假定可跳过登塔。','https://www.catedraldesevilla.es/visita-cultural/horarios-y-tarifas/'),step('16:00–17:30','Santa Cruz 街区散步','photo'),step('晚间','弗拉明戈或晚餐，演出待查询','free')],'时间不足先删晚间演出；如不登塔，另查适用票种或向场馆核实。','保留预约室内部分，减少街区散步。'))
D.append(day('2027-01-03','Seville → Granada','granada','抵达格拉纳达 · 山城街区','Santa Justa → 格拉纳达站 → 大教堂 → 观景台',['Santa Justa','格拉纳达站','格拉纳达大教堂','圣尼古拉斯观景台'],[step('上午','从 Santa Justa 前往格拉纳达；班次待查','hop'),step('抵达后','寄存行李、午餐；抵达时间待车票确认','lodging'),step('下午','格拉纳达大教堂周边、Albaicín','free'),step('傍晚','圣尼古拉斯观景台；光线及天气现场判断','photo')],'晚到则取消上坡，只走市中心。','改为市中心已确认开放的室内场所。',True))
D.append(day('2027-01-04','Granada','granada','阿尔罕布拉宫 · 花园与纳斯里德宫','阿尔罕布拉宫 → 市中心茶馆',['阿尔罕布拉宫','格拉纳达大教堂'],[step('08:30–09:00','到阿尔罕布拉宫入口及证件安检','hop'),step('09:00–13:00','阿尔罕布拉宫、纳斯里德宫及 Generalife','anchor','每人携带预订证件原件与 QR 票；Nasrid 须按票面时段入场；不带大行李，时间仅为计划。','https://www.alhambra-patronato.es/en/visit/opening-hours-and-prices'),step('13:00–14:15','市中心午餐','meal'),step('下午','中心街区、茶馆；整理行李','free')],'保留票面 Nasrid 时段，删茶馆。','雨天穿防滑鞋并减少户外停留。'))
D.append(day('2027-01-05','Granada → Barcelona','barcelona','返巴塞罗那 · 三王巡游','格拉纳达 → 巴塞罗那 → 三王巡游',['格拉纳达站','Barcelona Sants'],[step('上午','优先选择较早抵巴塞罗那的车或飞机，日期班次待查','hop'),step('抵达后','入住或寄存行李、用餐','lodging'),step('傍晚','三王巡游：等 2027 官方路线与时间公布','photo','时间、路线和道路管制均待核实；延误可取消。'),step('晚上','准备 1/6 早餐、机场交通与行李','check')],'转场延误则取消巡游，确保在巴塞罗那过夜。','雨天先按市府公告核实活动是否继续。',True))
D.append(day('2027-01-06','Barcelona','barcelona','三王节 · 前往机场返程','住宿 → BCN 机场 → 北京',['BCN机场'],[step('约07:00','按住宿和假日接驳时刻出发，时间待倒推','hop'),step('08:30','建议抵达 BCN 机场，核对航站楼、行李和值机','check'),step('11:30','国航起飞往北京；次日 05:30 抵京','arrival','航班号及航站楼以订单为准。')],'交通异常优先改用可靠接驳，不安排观光。','不安排户外景点。',True))
# 冬季机位随既有路线嵌入；日落为当地时间天文估算，光线取决于天气与遮挡。
D[0]['timeline'][2]['note'] = '大教堂周边及主教桥可拍街巷人像；冬季约17:30日落，窄巷可能较早进入阴影。'
D[1]['timeline'][2]['note'] = 'Avinguda Gaudí 沿线拍圣家堂远景和圣保罗外观；留在人行道，别进入车道取景。'
D[1]['timeline'][4]['note'] += ' 冬季约17:30日落，屋顶与街景尽量排在天黑前；阴雨优先室内。'
D[3]['timeline'][0]['note'] = '广场桥拱、瓷砖长椅与回廊适合双人互拍；雨后石面可能湿滑。元旦具体开放以现场公告为准。'
D[3]['timeline'][2]['note'] = '河岸及桥上拍人像；冬季约18:16日落，选择视天气调整停留。'
D[4]['timeline'][4]['note'] = '利用拱巷和广场拍人像；当天约18:17日落，窄街光照受建筑遮挡。'
D[5]['timeline'][3]['t'] = '约17:15–18:15'
D[5]['timeline'][3]['what'] = '圣尼古拉斯观景台：红宫与雪山方向'
D[5]['timeline'][3]['note'] = '1/3日落约18:09；建议提前到场，前提是车次准时且天气允许。落日和积雪不保证；坡路防滑，天黑后结伴下山。'
D[6]['timeline'][1]['note'] += ' 冬季现行开放至18:00；庭院拍照留意场馆当日规则与参观秩序。'
# Transport modes represent planning candidates, not purchased or date-verified services.
D[0]['stops'][1]['mode']='bus'
D[0].pop('day_map',None)
D[2]['stops'][1]['mode']='train'
D[5]['stops'][1]['mode']='train'
D[7]['stops'][1]['mode']='train'
H=[{'city_id':'barcelona','start':'2026-12-29','end':'2026-12-31','status':'to_select','base':'12/29–12/31 · 2 晚 · 2 人','area':'Eixample / Sants 交通方便区域','why':'La Palmera 临近 Liceu，去 Sants 可考虑地铁 L3；老城需留意人流、噪音及共用厕所，实际税费待核实。','options':[{'name':'Airbnb · Hostal La Palmera 双床（待核实）','band':'4.77/5，852评价；市中心两张床、独立淋浴、共用厕所；¥1,781/2晚，旅游税另付','link':'https://zh.airbnb.com/rooms/52047182?check_in=2026-12-29&check_out=2026-12-31&adults=2&currency=CNY'},{'name':'Airbnb 巴塞罗那房源搜索','band':'目标日期 2 人；价格含税费和两张床须逐项核实','link':'https://zh.airbnb.com/s/Barcelona--Spain/homes?checkin=2026-12-29&checkout=2026-12-31&adults=2&currency=CNY'}]},
{'city_id':'seville','start':'2026-12-31','end':'2027-01-03','status':'to_select','base':'12/31–1/3 · 3 晚 · 2 人','area':'Triana / 老城边缘 / Santa Justa','why':'Alameda 老城利于步行游览；准确地址、去 Santa Justa 的交通、夜间噪音与总价待核实。','options':[{'name':'Airbnb · Alameda 老城独卫双床（待核实）','band':'4.9/5，284评价；两张单人床；¥2,909/3晚，最终税费待查','link':'https://zh.airbnb.com/rooms/15877284?check_in=2026-12-31&check_out=2027-01-03&adults=2&currency=CNY'},{'name':'Airbnb · Casa Lasso Triana（待核实）','band':'4.88/5；双人床＋沙发床；页面税前 ¥2,590 / 3晚，税费待核实','link':'https://zh.airbnb.com/rooms/904483733325681919?check_in=2026-12-31&check_out=2027-01-03&adults=2&currency=CNY'}]},
{'city_id':'granada','start':'2027-01-03','end':'2027-01-05','status':'to_select','base':'1/3–1/5 · 2 晚 · 2 人','area':'大教堂 / 火车站方便区域','why':'Gamboa 位于大教堂附近，适合市中心步行；核实车站接驳、隔音与实际总价。','options':[{'name':'Airbnb · 陶宾宫殿式公寓双床房（待核实）','band':'4.9/5；两张单人床；页面税前 ¥1,039 / 2晚，税费待核实','link':'https://zh.airbnb.com/rooms/1558015621284285662?check_in=2027-01-03&check_out=2027-01-05&adults=2&currency=CNY'},{'name':'携程 · Palacio de Los Gamboa（待核实）','band':'4.5分；两张单人床，含税费均价 ¥699/晚；最终总额待复核','link':'https://hotels.ctrip.com/hotels/1625246.html?checkIn=2027-01-03&checkOut=2027-01-05&crn=1&adult=2&children=0'}]},
{'city_id':'barcelona','start':'2027-01-05','end':'2027-01-06','status':'to_select','base':'1/5–1/6 · 返程前 1 晚 · 2 人','area':'机场接驳方便、次日早出发','why':'西班牙广场附近有机场巴士；核实双床及 1/6 假日班次、站点和航站楼。','options':[{'name':'携程 · Occidental Barcelona 1929（床型待确认）','band':'三星 4.5/5；西班牙广场旁；¥537＋到店¥115；双床或大床，不能保证双床','link':'https://hotels.ctrip.com/hotels/46315768.html?checkIn=2027-01-05&checkOut=2027-01-06&crn=1&adult=2&children=0'},{'name':'Airbnb · Raval 独卫双床房（待核实）','band':'4.79/5；两张单人床；税前 ¥557/晚，最终税费待查','link':'https://zh.airbnb.com/rooms/52047490?check_in=2027-01-05&check_out=2027-01-06&adults=2&currency=CNY'},{'name':'Airbnb 巴塞罗那返程夜搜索','band':'1 晚 2 人；总价和床型需复核','link':'https://zh.airbnb.com/s/Barcelona--Spain/homes?checkin=2027-01-05&checkout=2027-01-06&adults=2&currency=CNY'}]}]
# 酒店及双人早餐优先；保留历史民宿线索并明确景观尚未核实。
H[0]['options'] = H[0]['options'][:1]
H[1]['options'] = H[1]['options'][:1]
H[2]['options'].reverse()
H[3]['options'] = H[3]['options'][:2]
for hotel in H:
    hotel['why'] += ' 优先寻找含两人早餐的酒店；民宿景观尚待核实。'
    for option in hotel['options']:
        if option['name'].startswith('Airbnb'):
            option['name'] = option['name'].replace('Airbnb ·', 'Airbnb 备选 ·', 1)
            option['band'] += '；风景及早餐未确认'
H[2]['options'][0]['band'] = '4.5分；两张单人床；旧价 ¥699/晚不含早餐，含双早及最终总价待核；携程早餐一般07:00–10:00，节日需复核'
H[3]['options'][0]['band'] += '；早餐未确认'
p={'trip':'西班牙跨年三城行｜两人','lang':'zh','tz':'Europe/Madrid','prefs':{'theme':'illustrated','pictures':'stock','travel_style':'public','lodging':'两人两张独立床、高评分、交通方便；携程至少三星；整间每晚含税不超过CNY1000','pace':3,'budget':'住宿每晚CNY1000以内','scenery':['city'],'notes':'两人大学生；12/28香港出发，1/7抵港；国航经北京。'},'meta':{'dates':'2026-12-28 → 2027-01-07','party':'2位大学生','route':'Barcelona → Seville → Granada → Barcelona','budget_total':'住宿实际总价、税费与床型待查','generated':'2026-10-28','self_check':'行程时刻为草案，酒店及车票未预订。'},'decisions':['城市顺序按旅客要求，1/5回巴塞罗那、1/6国际返程。','元旦王宫闭馆；三王巡游时间待官方公布。'],'checklist':[{'item':'核实国航订单与北京中转','deadline':'2026-11-15','note':'自定提醒；确认航班号、行李直挂、机场航站楼与休息室资格。'},{'item':'核实并决定两人双床住宿','deadline':'2026-11-20','note':'自定提醒；按四段日期比较含税总价与退改。'},{'item':'检查景点门票及城际交通','deadline':'2026-12-01','note':'自定提醒；以官方放票时间为准，尤其确认阿尔罕布拉宫及1月5日返巴塞罗那。'},{'item':'复核节日运营与机场交通','deadline':'2026-12-20','note':'自定提醒；核查1月1日与三王节官方公告。'}],'legs':[{'type':'flight','date':'2026-12-28','carrier':'Air China','from':'香港','to':'北京','dep':'13:40','arr':'17:05','note':'用户提供；航班号待订单核实'},{'type':'flight','date':'2026-12-29','carrier':'Air China','from':'北京','to':'巴塞罗那','dep':'03:05','arr':'08:05','note':'用户提供；北京中转10小时'},{'type':'bus','date':'2026-12-29','from':'BCN机场','to':'哥特区','note':'机场接驳方案及实际班次待核实'},{'type':'train','date':'2026-12-31','from':'Barcelona Sants','to':'Santa Justa','note':'候选铁路；具体班次待核实'},{'type':'train','date':'2027-01-03','from':'Santa Justa','to':'格拉纳达站','note':'候选铁路；具体班次待核实'},{'type':'train','date':'2027-01-05','from':'格拉纳达站','to':'Barcelona Sants','note':'候选铁路；与航班比较，班次待核实'},{'type':'flight','date':'2027-01-06','carrier':'Air China','from':'巴塞罗那','to':'北京','dep':'11:30','arr':'次日05:30','note':'用户提供；订单核实航班号'},{'type':'flight','date':'2027-01-07','carrier':'Air China','from':'北京','to':'香港','dep':'13:00','arr':'16:45','note':'用户提供；中转7.5小时'}], 'days':D,'hotels':H,'budget':[],'brief':{'insurance':'核对申根全程及保险援助渠道。'},'unverified':['航班号、北京机场航站楼、行李直挂、城际班次、酒店含税及双床、景点票务和2027三王巡游。']}
p['prefs']['lodging'] = '优先酒店及两人早餐，民宿仅考虑景观或拍照突出；两张独立床、高评分、交通方便；携程至少三星；每晚含早餐及必付税费不超过CNY1000'
p['checklist'][1]['note'] = '按四段日期比较双床、两人早餐、含税总价与退改；确认1/6早餐供应时间。'
(R/'plan.geo.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(R/'trip-guide-ui/public/plan.geo.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Wrote',len(D),'days and',len(H),'lodging periods')
