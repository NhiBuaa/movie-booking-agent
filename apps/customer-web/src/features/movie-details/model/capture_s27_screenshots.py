import os
import time
from playwright.sync_api import sync_playwright

output_dir = r"C:\Users\NhiBuaa\.gemini\antigravity\brain\e5c65a3a-3639-4adf-8c29-ceba7c60d57d"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 1444},
            device_scale_factor=1.0,
        )
        page = context.new_page()

        print("1. Testing S27 - User Profile & CinePreferences...")
        page.goto("http://localhost:3000/profile", wait_until="networkidle")
        page.wait_for_timeout(1500)

        # Full page screenshot
        s27_shot = os.path.join(output_dir, "s27_profile_actual.png")
        page.screenshot(path=s27_shot)
        print(f"Captured S27 Default: {s27_shot}")

        # Check Header TÀI KHOẢN button active
        account_btn = page.locator('header a[href="/profile"]')
        assert account_btn.count() > 0, "Header account button not found"
        print("Header account button verified")

        # Check Shortcuts
        assert page.locator('[data-testid="shortcut-membership"]').count() > 0, "Membership shortcut missing"
        assert page.locator('[data-testid="shortcut-vouchers"]').count() > 0, "Vouchers shortcut missing"
        assert page.locator('[data-testid="shortcut-notifications"]').count() > 0, "Notifications shortcut missing"
        assert page.locator('[data-testid="shortcut-help"]').count() > 0, "Help shortcut missing"
        print("All 4 shortcuts verified")

        # Test Password Modal
        pwd_btn = page.locator('[data-testid="open-password-modal-btn"]')
        pwd_btn.click()
        page.wait_for_timeout(500)
        modal_shot = os.path.join(output_dir, "s27_profile_password_modal.png")
        page.screenshot(path=modal_shot)
        print(f"Captured Password Modal: {modal_shot}")
        page.locator('button[aria-label="Đóng"]').click()
        page.wait_for_timeout(300)

        # Test Save CinePreferences & Toast
        save_btn = page.locator('[data-testid="save-cine-prefs-btn"]')
        save_btn.click()
        page.wait_for_timeout(600)
        toast_shot = os.path.join(output_dir, "s27_profile_toast_saved.png")
        page.screenshot(path=toast_shot)
        print(f"Captured S27 Toast: {toast_shot}")

        # Verify Talk to Buaa AI link
        talk_btn = page.locator('[data-testid="talk-to-buaa-cta"]')
        assert talk_btn.get_attribute("href") == "/chat", "Talk to Buaa button must link to /chat"
        print("Talk to Buaa CTA verified: links to /chat")

        browser.close()
        print("\nAll S27 Playwright visual assertions PASSED!")

if __name__ == "__main__":
    run()
