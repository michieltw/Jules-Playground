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
        await page.wait_for_timeout(1000)

        # swipe action
        await page.mouse.move(500, 700)
        await page.mouse.down()
        await page.mouse.move(500, 200, steps=10)
        await page.mouse.up()

        await page.wait_for_timeout(1500)
        await page.screenshot(path="verification_gameplay_2.png")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
