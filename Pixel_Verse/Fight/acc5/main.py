from Battle import Battle
from Pixelverse import UserPixel
import json
from random import randint
import asyncio
from colorama import Fore, Style, init, Back
import os
import time
import sys

def clear():
    """Clears the terminal screen."""
    if os.name == 'nt':
        os.system('cls')
    else:
        os.system('clear')

def split_chunk(var):
    """Splits a string or number into chunks of 3, separated by spaces.

    Args:
        var: The string or number to be split.

    Returns:
        The formatted string with chunks of 3.
    """
    if isinstance(var, int):
        var = str(var)
    n = 3
    var = var[::-1]
    return ' '.join([var[i:i + n] for i in range(0, len(var), n)])[::-1]

async def main():
    """Main asynchronous function to run the Pixelverse bot."""
    
    init()
    user = UserPixel()

    while True:
        try:
            userInfo = user.getUser()
            stats = user.getStats()

            message = f"""
                                    {Back.MAGENTA}{Fore.WHITE}PixelBot{Style.RESET_ALL} | Made by {Back.MAGENTA + Fore.WHITE}S1NJED{Style.RESET_ALL}

                                {Fore.GREEN}ANH{Style.RESET_ALL} HUY {Back.WHITE + Fore.BLACK}ĐẸP TRAI{Style.RESET_ALL}

                        Logged in as {Style.BRIGHT + Fore.GREEN}{userInfo['username']}{Style.RESET_ALL}{Fore.GREEN + Style.BRIGHT}

    ===================== {Style.RESET_ALL} {Back.YELLOW + Fore.BLACK}STATS{Style.RESET_ALL} {Fore.GREEN + Style.BRIGHT} =====================  {Style.RESET_ALL}

                        > {Back.YELLOW + Fore.BLACK}Balance{Style.RESET_ALL}: {Style.BRIGHT}{split_chunk(str(int(userInfo['clicksCount'])))}{Style.RESET_ALL}

                        > battlesCount{Style.RESET_ALL}: {Style.BRIGHT}{split_chunk(str(stats['battlesCount']))}{Style.RESET_ALL}
                        > {Back.GREEN}Wins{Style.RESET_ALL}:         {Style.BRIGHT}{split_chunk(str(stats['wins']))}{Style.RESET_ALL}
                        > {Back.RED}Loses{Style.RESET_ALL}:        {Style.BRIGHT}{split_chunk(str(stats['loses']))}{Style.RESET_ALL}
                        > {Back.GREEN}Money Won{Style.RESET_ALL}:    {Style.BRIGHT}{split_chunk(str(stats['winsReward']))}{Style.RESET_ALL}
                        > {Back.RED}Money Lost{Style.RESET_ALL}:   {Style.BRIGHT}-{split_chunk(str(abs(stats['losesReward'])))}{Style.RESET_ALL}
                        > {Back.GREEN}Total earned{Style.RESET_ALL}: {Style.BRIGHT}{split_chunk(str(stats['winsReward'] - stats['losesReward']))}{Style.RESET_ALL}

            """
            print(message)

            # Read config file 
            with open('./config.json', 'r') as config_file:
                config = json.load(config_file)


            # Battle logic 
            battle = Battle()
            await battle.connect()
            del battle

            user.claim()
            #user.upgradePets(auto_upgrade=config['auto_upgrade'])  # Pass auto_upgrade choice

            timeToWait = randint(5, 10)
            print(f"{user.space}> Waiting {Back.RED + Fore.WHITE}{timeToWait}{Style.RESET_ALL} seconds.")
            await asyncio.sleep(timeToWait)
            clear()

        except Exception as e:
            print(f"{user.space}> Encountered an error: {type(e).__name__} - {e}")
            print(f"{user.space}> Restarting in 5 seconds...")
            await asyncio.sleep(5)
            clear()

if __name__ == '__main__':
    while True:
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print(f"{UserPixel().space}> Goodbye :)")
            sys.exit(0)
        except Exception as e:

            if UserPixel().isBroken():
                print(f"{UserPixel().space}> The server seems down, restarting in 5 minutes ...")
                time.sleep(60*5)
            else:
                print(f"{UserPixel().space}> Critical error: {type(e).__name__} - {e}")
                print(f"{UserPixel().space}> Restarting in 10 seconds...")
                time.sleep(10)

            clear()
