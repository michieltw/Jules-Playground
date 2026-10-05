import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        pwd = os.getcwd()
        await page.goto(f"file://{pwd}/game.html")
        await page.wait_for_timeout(3000)

        await page.click('#btnPlayNow')
        await page.wait_for_timeout(1000)

        await page.screenshot(path="verification_stick.png")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
