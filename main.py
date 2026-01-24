import asyncio
from datetime import datetime, timezone
from colorama import Fore, Style, init

from src.referee import check_all_traders

init(autoreset=True)


async def main():
    print(f"{Style.BRIGHT}=== Syntax Engine Live Check (Multi-User) ==={Style.RESET_ALL}")
    print("Press Ctrl+C to exit.\n")

    while True:
        now = datetime.now(timezone.utc).isoformat()
        print(f"{Fore.CYAN}{'='*50}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}[{now}]{Style.RESET_ALL}")
        print(f"{Fore.BLUE}>>> Initiating Multi-User Connection Check...{Style.RESET_ALL}\n")

        await check_all_traders()

        print(f"\n{Fore.MAGENTA}Sleeping 30s before next check...{Style.RESET_ALL}\n")
        await asyncio.sleep(30)


if __name__ == "__main__":
    asyncio.run(main())
