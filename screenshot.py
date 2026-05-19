import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Abriendo pagina...")
        await page.goto('http://localhost:8080/')
        
        print("Esperando a que el loader desaparezca (el modelo puede tardar en cargar)...")
        # Wait for the loader UI to disappear, meaning the 3D model is loaded and added to scene
        await page.wait_for_selector('.loader-3d', state='hidden', timeout=60000)
        
        print("Modelo cargado. Esperando 3 segundos adicionales para estabilizacion de la camara...")
        await page.wait_for_timeout(3000)
        
        # Ocultar la capa de UI que pueda estorbar para que la foto salga limpia
        await page.evaluate("""
            document.querySelector('header').style.display = 'none';
            document.querySelector('.hero-content').style.display = 'none';
        """)
        
        print("Tomando captura del render 3D...")
        canvas_element = await page.query_selector('#canvas-container')
        
        # Save to assets folder
        output_path = os.path.join(os.getcwd(), 'assets', 'room_render.png')
        await page.screenshot(path=output_path)
        
        print(f"Captura exitosa y guardada en {output_path}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
