import levenshtein from 'js-levenshtein';
import { FaLock } from 'react-icons/fa';
import * as icons from 'simple-icons';
import { twJoin } from 'tailwind-merge';

import accrue from '../images/accrue.svg?raw';
import amazon from '../images/amazon.svg?raw';
import bastillion from '../images/bastillion.png';
import betterment from '../images/betterment.png';
import carta from '../images/carta.png';
import guideline from '../images/guideline.png';
import headway from '../images/headway.svg';
import idme from '../images/id.me.png';
import justworks from '../images/justworks.jpg';
import microsoft from '../images/microsoft.svg?raw';
import nintendo from '../images/nintendo.svg?raw';
import sequoia from '../images/sequoia.png';
import twitter from '../images/twitter.svg?raw';
import uwcu from '../images/uwcu.png';

enum IconType {
  Icon = 'Icon',
  Image = 'Image',
}

interface Icon {
  svg: string;
  hex: string;
  title: string;
  type: IconType.Icon;
  padding?: boolean | string;
}

interface Image {
  url: string;
  padding?: boolean | string;
  type: IconType.Image;
}

function getIcon(name?: string): Icon | Image | undefined {
  if (!name) return undefined;

  const icon = Object.entries(icons)
    .filter(
      (e) =>
        name.toLowerCase().includes(e[1].title.toLowerCase()) &&
        levenshtein(name.toLowerCase(), e[1].title.toLowerCase()) < name.length / 2
    )
    .sort((a, b) => {
      return (
        levenshtein(name.toLowerCase(), a[1].title.toLowerCase()) -
        levenshtein(name.toLowerCase(), b[1].title.toLowerCase())
      );
    })[0];

  // handle one-off cases
  switch (name.toLowerCase()) {
    case 'accrue':
      return { svg: accrue, title: 'Accrue', hex: 'ffffff', padding: 'p-2', type: IconType.Icon };
    case 'amazon':
      return { svg: amazon, title: 'Amazon', hex: 'ff9900', padding: true, type: IconType.Icon };
    case 'bastillion':
      return { url: bastillion, padding: true, type: IconType.Image };
    case 'betterment':
      return { url: betterment, type: IconType.Image };
    case 'carta':
      return { url: carta, type: IconType.Image };
    case 'facebook':
      return { ...icons.siFacebook, padding: false, type: IconType.Icon };
    case 'guideline':
      return { url: guideline, type: IconType.Image };
    case 'headway':
      return { url: headway, type: IconType.Image, padding: 'p-1.5' };
    case 'id.me':
      return { url: idme, type: IconType.Image };
    case 'justworks':
      return { url: justworks, type: IconType.Image };
    case 'microsoft':
      return { svg: microsoft, title: 'Microsoft', hex: '929292', padding: 'p-1.5', type: IconType.Icon };
    case 'nintendo':
      return { svg: nintendo, title: 'Nintendo', hex: 'dd2020', padding: 'p-1', type: IconType.Icon };
    case 'nas':
    case 'synology':
      return { ...icons.siSynology, padding: 'p-1.5', type: IconType.Icon };
    case 'uw credit union':
    case 'uwcu':
      return { url: uwcu, padding: true, type: IconType.Image };
    case 'sequoia':
      return { url: sequoia, padding: true, type: IconType.Image };
    case 'twitter':
      return { svg: twitter, title: 'Twitter', hex: '00aced', padding: true, type: IconType.Icon };
    default:
      break;
  }

  return icon ? { ...icon[1], type: IconType.Icon, padding: true } : undefined;
}

const darkColor = 'bg-slate-900';
const lightColor = 'bg-slate-800';
function getColors(i?: Icon | Image): { background: string; fill?: string } {
  if (!i || i.type === IconType.Image) return { background: darkColor, fill: lightColor };

  const icon = i as Icon;
  let background = darkColor;
  let fill = '#' + icon.hex;

  // handle one-off cases
  switch (icon.title.toLowerCase()) {
    case 'epic games':
      fill = 'white';
      break;
    case 'github':
    case 'patreon':
    case 'ubisoft':
      background = 'bg-slate-100';
      break;
  }

  return { background, fill };
}

export function AppIcon({ name, className }: { name: string; className?: string }) {
  const icon = getIcon(name);

  const colors = getColors(icon);

  const imgClass =
    'w-12 h-12 rounded-full border border-slate-400 flex justify-center items-center aspect-square ' +
    colors.background +
    ' ' +
    className;

  if (!icon) {
    if (name) console.warn(`No icon found for ${name}`);
    return (
      <div className={imgClass}>
        <FaLock />
      </div>
    );
  }

  const padding = typeof icon.padding === 'string' ? icon.padding : undefined;

  if (icon.type === IconType.Image)
    return <img src={icon.url} className={twJoin(imgClass, 'object-cover', padding || (icon.padding && 'p-1'))} />;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: icon.svg }}
      className={twJoin(imgClass, padding || (icon.padding ? 'p-2.5' : 'p-0.5'))}
      style={{ fill: colors.fill }}
    />
  );
}
