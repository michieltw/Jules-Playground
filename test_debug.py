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
        await page.wait_for_timeout(3000)

        # We need to expose `game` to the window object to query puck pos.
        metrics = await page.evaluate('''() => {
            const puckPos = window.scene.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
            return {
                puck_pos: puckPos ? puckPos.position : null
            };
        }''')
        print(metrics)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
