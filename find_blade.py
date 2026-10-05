import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        pwd = os.getcwd()
        await page.goto(f"file://{pwd}/game.html")
        await page.wait_for_timeout(2000)
        await page.click('#btnPlayNow')
        await page.wait_for_timeout(3000) # wait for stick to drop fully

        metrics = await page.evaluate('''() => {
            let stick = null;
            scene.children.forEach(c => {
                if (c.type === 'Group') stick = c;
            });

            if (!stick) return "no stick";

            stick.updateMatrixWorld(true);
            let bladeVerts = [];
            let minY = Infinity;
            stick.traverse(c => {
                if (c.isMesh && c.geometry) {
                    const pos = c.geometry.attributes.position;
                    const mat = c.matrixWorld;
                    const v = new window.THREE.Vector3();
                    for(let i=0; i<pos.count; i++) {
                        v.fromBufferAttribute(pos, i);
                        v.applyMatrix4(mat);
                        if (v.y < minY) minY = v.y;
                        if (v.y < 50) { // increased threshold
                            bladeVerts.push({x: v.x, y: v.y, z: v.z});
                        }
                    }
                }
            });

            if (bladeVerts.length === 0) return "minY=" + minY;

            let minX=Infinity, maxX=-Infinity, minZ=Infinity, maxZ=-Infinity;
            bladeVerts.forEach(v => {
                if(v.x < minX) minX = v.x;
                if(v.x > maxX) maxX = v.x;
                if(v.z < minZ) minZ = v.z;
                if(v.z > maxZ) maxZ = v.z;
            });

            return {
                minY: minY,
                bladeCenter: {
                    x: (minX+maxX)/2,
                    z: (minZ+maxZ)/2,
                },
                bounds: {minX, maxX, minZ, maxZ}
            };
        }''')
        print(metrics)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
