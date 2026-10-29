import io,json,math,urllib.request,time,sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
base=Path(__file__).parent
data=json.loads((base/'areas.json').read_text())
font='/System/Library/Fonts/Hiragino Sans GB.ttc'
title=ImageFont.truetype(font,40); sub=ImageFont.truetype(font,23); label=ImageFont.truetype(font,19); small=ImageFont.truetype(font,16)
def world(lat,lon,z):
 n=2**z*256; p=math.radians(lat)
 return ((lon+180)/360*n,(1-math.asinh(math.tan(p))/math.pi)/2*n)
for city in data['cities']:
 if len(sys.argv)>1 and city['id']!=sys.argv[1]: continue
 z=city['zoom']; cx,cy=world(*city['center'],z); w,h=1024,768; ox=cx-w/2; oy=cy-h/2
 tiles=Image.new('RGB',(w,h),'#e8ecea')
 for tx in range(math.floor(ox/256),math.floor((ox+w-1)/256)+1):
  for ty in range(math.floor(oy/256),math.floor((oy+h-1)/256)+1):
   req=urllib.request.Request(f'https://tile.openstreetmap.org/{z}/{tx}/{ty}.png',headers={'User-Agent':'SpainTripHotelAreaMaps/1.0 research map'})
   for attempt in range(4):
    try:
     with urllib.request.urlopen(req,timeout=10) as response: tile=Image.open(io.BytesIO(response.read())).convert('RGB')
     break
    except Exception:
     if attempt==3: raise
     time.sleep(1)
   tiles.paste(tile,(round(tx*256-ox),round(ty*256-oy)))
 overlay=Image.new('RGBA',(w,h)); draw=ImageDraw.Draw(overlay)
 for area in city['areas']:
  x,y=world(*area['center'],z); x-=ox;y-=oy
  meters_per_px=156543.03392*math.cos(math.radians(area['center'][0]))/2**z
  rad=area['radius']/meters_per_px
  draw.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(19,119,180,48),outline=(14,91,149,220),width=3)
 for mark in city['markers']:
  x,y=world(*mark['at'],z);x-=ox;y-=oy
  if 10<x<w-10 and 10<y<h-10:
   draw.ellipse((x-6,y-6,x+6,y+6),fill='#f37c41',outline='white',width=2)
   bbox=draw.textbbox((x+10,y-16),mark['name'],font=label,stroke_width=2)
   draw.rounded_rectangle((bbox[0]-4,bbox[1]-3,bbox[2]+4,bbox[3]+3),radius=5,fill=(255,255,255,230))
   draw.text((x+10,y-16),mark['name'],font=label,fill='#102f49')
 tiles=Image.alpha_composite(tiles.convert('RGBA'),overlay)
 out=Image.new('RGB',(w,906),'#f6f8f8');out.paste(tiles.convert('RGB'),(0,96));d=ImageDraw.Draw(out)
 d.text((25,11),city['title'],font=title,fill='#173c55');d.text((240,27),city['subtitle'],font=sub,fill='#34536a')
 d.rounded_rectangle((20,877,39,895),radius=4,fill='#78b7d8',outline='#145c92',width=2)
 d.text((48,873),'住宿搜索范围示意，非行政或安全边界',font=small,fill='#27475b')
 d.text((640,873),'© OpenStreetMap contributors',font=small,fill='#27475b')
 path=base/(city['id']+'.png');out.save(path,optimize=True);print(path)
