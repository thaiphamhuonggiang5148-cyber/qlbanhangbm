const imageModules = import.meta.glob ('../img/*.{png,jpg,webp,gif,svg}',{
    eager:true
});
const baseName = (path) =>{
    const name = path.split('/').pop() || '';
    return name.replace (/\.[^.]+$/, '');
};
export const imageMap = Object.fromEntries(
    Object.entries(imageModules).map(([path, mod]) =>[baseName(path),mod.default])
);
export function resolveProductTmage(imageKey){
    if (imageKey == null || imageKey === "") return undefined;
    return imageMap [imageKey]
    }
