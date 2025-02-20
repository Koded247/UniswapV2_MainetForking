import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const thresholdAddress = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5";
    const kuCoinAddress = "0xf34960d9d60be18cC1D5Afc1A6F012A723a28811";
    const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const liquidityProvider = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

  
    await helpers.impersonateAccount(liquidityProvider);
    const impersonateSigner = await ethers.getSigner(liquidityProvider);

 
    const thresholdContract = await ethers.getContractAt("IERC20", thresholdAddress);
    const kucoinContract = await ethers.getContractAt("IERC20", kuCoinAddress);
    const uniswapRouterContract = await ethers.getContractAt("IUniswapV2Router01", uniswapRouter);

    console.log("------------Let's get started! 🤩-------------");

  
    const thresholdBalance = await thresholdContract.balanceOf(liquidityProvider);
    const kucoinBalance = await kucoinContract.balanceOf(liquidityProvider);

    console.log("\n\n---------------Before Swap 😁---------------");
    console.log("Initial Threshold balance: " + ethers.formatUnits(thresholdBalance, 18));
    console.log("Initial KuCoin balance: " + ethers.formatUnits(kucoinBalance, 6));

    
    const amountOut = ethers.parseUnits("10", 6); 
    const amountInMax = ethers.parseUnits("9000000", 18); 
    const path = [thresholdAddress, kuCoinAddress]; /
    const to = liquidityProvider; 
    const deadline = (await helpers.time.latest()) + 3500;

    
    console.log("\n\n---------------Approving Tokens ⌛---------------");

    console.log("Approving Threshold tokens...");
    const txThresholdApprove = await thresholdContract.connect(impersonateSigner).approve(uniswapRouter, amountInMax);
    await txThresholdApprove.wait();

 
    console.log("Swapping tokens...");
    const txSwap = await uniswapRouterContract.connect(impersonateSigner).swapTokensForExactTokens(
        amountOut,
        amountInMax,
        path,
        to,
        deadline
    );
    await txSwap.wait();

   
    const thresholdBalanceAfter = await thresholdContract.balanceOf(liquidityProvider);
    const kucoinBalanceAfter = await kucoinContract.balanceOf(liquidityProvider);

    console.log("\n\n---------------After Swap ⏲---------------");
    console.log("Final Threshold balance: " + ethers.formatUnits(thresholdBalanceAfter, 18));
    console.log("Final KuCoin balance: " + ethers.formatUnits(kucoinBalanceAfter, 6));

   
    const thresholdUsed = thresholdBalance - thresholdBalanceAfter;
    console.log("Threshold tokens used: " + ethers.formatUnits(thresholdUsed, 18));
    const kuCoinReceived = kucoinBalanceAfter - kucoinBalance;
    console.log("KuCoin tokens received: " + ethers.formatUnits(kuCoinReceived, 6));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});