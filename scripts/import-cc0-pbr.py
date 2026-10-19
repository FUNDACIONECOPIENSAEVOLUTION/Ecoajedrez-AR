#!/usr/bin/env python3
"""Download CC0 PBR relief textures for ECOAJEDREZ (build time only).
Uses vetted providers, packs true albedo + OpenGL normal + roughness in <=768px
WebP maps. No external image requests at runtime. Never claim an invented scan.
"""
import hashlib, io, json, zipfile
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import quote,urlparse
from datetime import datetime,timezone
from PIL import Image, ImageOps

OUT=Path('assets/texturas-pbr')
SEARCH={
 'walnut':['walnut','dark walnut wood'],
 'oak':['oak wood','wood table'],
 'stone':['rock face','granite rock'],
 'marble':['white marble','marble'],
 'obsidian':['black rock','dark stone'],
 'bronze':['bronze metal','copper metal'],
 'gold':['gold metal','brass metal'],
 'ice':['ice surface','icy ice'],
 'basalt':['basalt rock','volcanic rock']
}
FALLBACK={'walnut':'Wood092','oak':'Wood094','stone':'Rock024',
 'marble':'Marble001','obsidian':'Rock035','bronze':'Metal032',
 'gold':'Metal039','ice':'Ice001','basalt':'Rock035'}
HOSTS={'api.polyhaven.com','dl.polyhaven.org','cdn.polyhaven.com','ambientcg.com'}
def get(url,limit=16000000):
 h=urlparse(url)
 if h.scheme!='https' or h.hostname not in HOSTS:raise ValueError('Forbidden host')
 with urlopen(Request(url,headers={'User-Agent':'ECOAJEDREZ-CC0-PBR/1.0 (GitHub source importer)'}),timeout=38) as f:
  data=f.read(limit+1)
 if len(data)>limit:raise ValueError('Asset over transfer limit')
 return data
def jget(url):return json.loads(get(url,6000000))
def role_urls(manifest):
 norm={str(key).lower().replace('_','').replace(' ',''):key for key in manifest}
 roles={'color':['diffuse','diff','albedo','basecolor'],
        'normal':['norgl','normalgl','normalopengl'],
        'roughness':['rough','roughness'],'metalness':['metal','metallic','metalness']}
 result={}
 for role,names in roles.items():
  for term in names:
   key=norm.get(term)
   if key is None:continue
   for resolution in ['1k','2k']:
    for ext in ['jpg','png','webp']:
     info=manifest[key].get(resolution,{}).get(ext)
     if isinstance(info,dict) and info.get('url'):
      result[role]=info['url'];break
    if role in result:break
   if role in result:break
 return result
def from_poly(id):
 if id=='ice':
  # Real CC0 snow/frost texture, not an unrelated dark rock labelled as ice.
  slug='snow_02'
  files=jget('https://api.polyhaven.com/files/'+slug)
  roles=role_urls(files)
  if all(roles.get(r) for r in ['color','normal','roughness']):
   return 'Poly Haven',slug,'https://polyhaven.com/a/'+slug,{r:get(url) for r,url in roles.items()},roles
 terms=SEARCH[id]
 keys={'walnut':['walnut'],'oak':['oak','wood'],'stone':['stone','rock','granite'],
  'marble':['marble'],'obsidian':['stone','rock','obsidian'],
  'bronze':['bronze','copper','metal'],'gold':['gold','brass','metal'],
  'ice':['ice','icy'],'basalt':['basalt','rock','volcanic']}
 for term in terms:
  try:
   found=jget('https://api.polyhaven.com/search?q='+quote(term)+'&t=textures&limit=8')
   ids=[r.get('slug') for r in found.get('results',[]) if r.get('slug') and r.get('score',0)>.38]
  except Exception as e:print('Poly search error',term,str(e)[:130],flush=True);continue
  for slug in ids:
   try:
    info=jget('https://api.polyhaven.com/info/'+slug)
    description=' '.join([info.get('name',''),info.get('category',''),' '.join(info.get('tags',[]))]).lower()
    if not any(t in description for t in keys[id]):continue
    roles=role_urls(jget('https://api.polyhaven.com/files/'+slug))
    if not all(roles.get(r) for r in ['color','normal','roughness']):continue
    return 'Poly Haven',slug,'https://polyhaven.com/a/'+slug,{r:get(url) for r,url in roles.items()},roles
   except Exception as e:print('Poly candidate failed',slug,str(e)[:110],flush=True)
 return None
def from_ambient(id):
 asset=FALLBACK[id]
 url='https://ambientcg.com/get?file='+asset+'_1K-JPG.zip'
 data=get(url,12000000)
 roles={};urls={}
 with zipfile.ZipFile(io.BytesIO(data)) as z:
  for role,suffix in [('color','_Color.'),('normal','_NormalGL.'),('roughness','_Roughness.'),('metalness','_Metalness.')]:
   files=[n for n in z.namelist() if suffix.lower() in n.lower() and n.lower().endswith(('.jpg','.png'))]
   if files:
    roles[role]=z.read(files[0]);urls[role]=url+'#'+files[0]
 if not all(r in roles for r in ['color','normal','roughness']):raise ValueError('PBR missing map')
 return 'ambientCG',asset,'https://ambientcg.com/view?id='+asset,roles,urls
def convert(raw,role='color',material='stone'):
 with Image.open(io.BytesIO(raw)) as img:
  img=ImageOps.exif_transpose(img).convert('RGB')
  img.thumbnail((768,768),Image.Resampling.LANCZOS)
  # PBR relief is genuine CC0 photogrammetry. Gold/bronze and magic ice
  # albedo are tinted art variants of a real metal/snow scan, never sold as raw
  # photographs of solid gold, bronze or transparent crystalline ice.
  if role=='color' and material in ('gold','bronze','ice'):
   mono=ImageOps.grayscale(img)
   palette={'gold':('#28160c','#ffd780'),
    'bronze':('#251a15','#c88b55'),
    'ice':('#687c8b','#e7f8ff')}
   img=ImageOps.colorize(mono,*palette[material])
  out=io.BytesIO();img.save(out,format='WEBP',quality=85,method=6)
  return out.getvalue(),[img.width,img.height]
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 meta={'version':1,'license':'CC0-1.0',
  'license_sources':['https://polyhaven.com/license','https://ambientcg.com/license'],
  'generation':datetime.now(timezone.utc).isoformat(),'materials':{}}
 failed=[]
 for id in SEARCH:
  print('Import:',id,flush=True)
  package=None
  try: package=from_poly(id)
  except Exception as e:print('Poly failed',str(e)[:160],flush=True)
  if not package:
   try:package=from_ambient(id)
   except Exception as e:print('ambientCG failed',str(e)[:160],flush=True)
  if not package:
   failed.append(id);continue
  author,slug,page,maps,urls=package
  try:
   results={};sources={}
   for role,raw in maps.items():
    converted,dimensions=convert(raw,role,id)
    if len(converted)>2000000:raise ValueError('Output exceeds 2MB')
    results[role+'.webp']=converted
    sources[role]={'url':urls[role],'sha256':hashlib.sha256(raw).hexdigest(),
     'size':len(converted),'resolution':dimensions,
     'color_reinterpreted_for_fantasy':role=='color' and id in ('gold','bronze','ice')}
   for req in ['color.webp','normal.webp','roughness.webp']:
    if req not in results:raise ValueError('Missing '+req)
   folder=OUT/id;folder.mkdir(parents=True,exist_ok=True)
   for filename,bits in results.items():(folder/filename).write_bytes(bits)
   meta['materials'][id]={'provider':author,'asset':slug,'source':page,'maps':sources}
   print('  OK',slug,list(results),flush=True)
  except Exception as e:
   print('  Conversion failed',str(e),flush=True);failed.append(id)
 (OUT/'FUENTES_CC0_IMPORTADAS.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print('COMPLETE',len(meta['materials']),'/9; failed',failed,flush=True)
 if len(meta['materials'])<3:raise RuntimeError('Fewer than 3 actual PBR materials; refusing publication')
 zip_path=OUT/'ECOAJEDREZ_RELIEVES_PBR_CC0.zip'
 with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  z.write(OUT/'FUENTES_CC0_IMPORTADAS.json','FUENTES_CC0_IMPORTADAS.json')
  for id in meta['materials']:
   for source in sorted((OUT/id).glob('*.webp')):
    z.write(source,source.relative_to(OUT))
 print('DOWNLOAD PACKAGE',zip_path,'bytes',zip_path.stat().st_size,flush=True)
if __name__=='__main__':main()
