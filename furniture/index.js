// furniture/index.js

/* ============================================================
   RE-EXPORTS
   ============================================================ */
export { mat, box } from './_helpers.js';

export {
  createBedBasic,
  createBedDouble,
  createBedPremium,
  createBedKing,
} from './beds.js';

export {
  createTableBasic,
  createTableRound,
  createTablePremium,
  createNightstand,
} from './tables.js';

export {
  createChairBasic,
  createChairUpholstered,
  createChairPremium,
} from './chairs.js';

export {
  createWardrobe,
  createCupboard,
} from './storage.js';

export {
  createGasStove,
  createElectricStove,
  createUnderSinkCabinet,
  createUpperCabinet,
  createDishwasher,
  createBuiltInOven,
  createElectricKettle,
  createBlender,
  createPots,
  createPan,
} from './kitchen.js';

export {
  createLamp,
  createDeskLamp,
  createCeilingPlafon,
  createCeilingChandelier,
  createWallSconce,
} from './lights.js';

export {
  createPlantPot,
  createBush,
  createSmallTree,
  createBigTree,
} from './plants.js';

export {
  createWall,
  createWallDoor,
  createWallWindow,
  createRoof,
} from './walls.js';

export {
  createSofa,
  createCoffeeTable,
  createBookshelf,
  createPainting,
  createCeilingFan,
  createGrassPatch,
  createFlowers,
} from './living.js';

export { createFloor } from './floors.js';
export { createStairBasic, createStairPremium } from './stairs.js';
export { createTV } from './tv.js';
export { createRug } from './others.js';
export { createPlayer } from './player.js';

/* ============================================================
   IMPORTS
   ============================================================ */
import { createBedBasic, createBedDouble, createBedPremium, createBedKing } from './beds.js';
import { createTableBasic, createTableRound, createTablePremium, createNightstand } from './tables.js';
import { createChairBasic, createChairUpholstered, createChairPremium } from './chairs.js';
import { createWardrobe, createCupboard } from './storage.js';
import {
  createGasStove,
  createElectricStove,
  createUnderSinkCabinet,
  createUpperCabinet,
  createDishwasher,
  createBuiltInOven,
  createElectricKettle,
  createBlender,
  createPots,
  createPan,
} from './kitchen.js';
import {
  createLamp,
  createDeskLamp,
  createCeilingPlafon,
  createCeilingChandelier,
  createWallSconce,
} from './lights.js';
import { 
  createPlantPot, 
  createBush, 
  createSmallTree, 
  createBigTree,
  createBigTreeHD,
  createSmallTreeHD,
  createBushHD
} from './plants.js';
import { createWall, createWallDoor, createWallWindow, createRoof } from './walls.js';
import { createSofa, createCoffeeTable, createBookshelf, createPainting, createCeilingFan, createGrassPatch, createFlowers } from './living.js';
import { createFloor } from './floors.js';
import { createStairBasic, createStairPremium } from './stairs.js';
import { createTV } from './tv.js';
import { createRug } from './others.js';
import { createPlayer } from './player.js';

/* ============================================================
   FÁBRICA
   ============================================================ */
export function createFurniture(type, color = null, style = null, quality = 'media') {
  const isHigh = quality === 'alta';

  switch (type) {
    case 'piso_madera':    return createFloor('piso_madera', color);
    case 'piso_baldosa':   return createFloor('piso_baldosa', color);
    case 'piso_cesped':    return createFloor('piso_cesped', color);
    case 'piso_piedra':    return createFloor('piso_piedra', color);
    case 'piso_azulejo':   return createFloor('piso_azulejo', color);
    case 'piso_liso':      return createFloor('piso_liso', color);

    case 'escalera_basica':   return createStairBasic(color);
    case 'escalera_premium':  return createStairPremium(color);

    case 'cama_basica':    return createBedBasic(color);
    case 'cama_doble':     return createBedDouble(color);
    case 'cama_premium':   return createBedPremium(color);
    case 'cama_king':      return createBedKing(color);

    case 'mesa_basica':    return createTableBasic(color);
    case 'mesa_redonda':   return createTableRound(color);
    case 'mesa_premium':   return createTablePremium(color);
    case 'mesa_luz':       return createNightstand(color);

    case 'silla_basica':   return createChairBasic(color);
    case 'silla_tapizada': return createChairUpholstered(color);
    case 'silla_premium':  return createChairPremium(color);

    case 'ropero':         return createWardrobe(color);
    case 'alacena':        return createCupboard(color);

    case 'cocina_gas':            return createGasStove(color);
    case 'cocina_electrica':      return createElectricStove(color);
    case 'bajo_mesada_pileta':    return createUnderSinkCabinet(color);
    case 'alacena_aerea':         return createUpperCabinet(color);
    case 'lavavajillas':          return createDishwasher(color);
    case 'horno_electrico':       return createBuiltInOven(color);
    case 'pava_electrica':        return createElectricKettle(color);
    case 'licuadora':             return createBlender(color);
    case 'ollas':                 return createPots();
    case 'sarten':                return createPan();

    case 'luz_plafon':            return createCeilingPlafon();
    case 'luz_candelabro':        return createCeilingChandelier();
    case 'luz_aplique':           return createWallSconce();

    case 'planta_maceta':  return createPlantPot(color);
    case 'arbusto':        
      if (isHigh) {
        try { return createBushHD(color); } catch (e) { return createBush(color); }
      }
      return createBush(color);
    case 'arbol_chico':    
      if (isHigh) {
        try { return createSmallTreeHD(color); } catch (e) { return createSmallTree(color); }
      }
      return createSmallTree(color);
    case 'arbol_grande':   
      if (isHigh) {
        try { return createBigTreeHD(color); } catch (e) { return createBigTree(color); }
      }
      return createBigTree(color);

    case 'lampara':        return createLamp();
    case 'lampara_mesa':   return createDeskLamp(color);
    case 'alfombra':       return createRug();

    case 'muro_basico':       return createWall(color);
    case 'muro_puerta':       return createWallDoor(color, 'madera');
    case 'muro_ventana':      return createWallWindow(color, 'cruz');
    case 'muro_premium':      return createWall(color);
    case 'muro_puerta_prem':  return createWallDoor(color, style ?? 'madera');
    case 'muro_ventana_prem': return createWallWindow(color, style ?? 'cruz');

    case 'techo_basico':   return createRoof(color);

    case 'tv':             return createTV(color);

    case 'player':         return createPlayer(color ?? '#4a90e2');

    // Living room furniture
    case 'sofa':              return createSofa(color);
    case 'mesa_ratona':       return createCoffeeTable(color);
    case 'estanteria':        return createBookshelf(color);
    case 'cuadro':            return createPainting(color);
    case 'techo_ventilador':  return createCeilingFan();
    
    // Decoración exterior
    case 'parche_pasto':      return createGrassPatch(quality);
    case 'flores':            return createFlowers(quality);

    default:
      console.warn('createFurniture: tipo desconocido', type);
      return null;
  }
}

export function place(group, x, y, z, rotY = 0) {
  group.position.x = x;
  group.position.z = z;
  group.rotation.y = rotY;
  if (group.position.y === 0) group.position.y = y;
  return group;
}