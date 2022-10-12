# Explain leverage v1

> 对leverage v1版本的基础解析
>
> core contracts:
>
> - `AddressFactory.sol`
> - `LeverageManager.sol`



## Basic Tech Logic

> 满足的基本处理逻辑是怎样的？那些是兑换辅助？那些步骤是核心杠杆和链上数据？

其中涉及的多种token之间的相互兑换过程

`LeverageManager`中定义了链上数据的基本机构体

```
struct DepositInfo {
        uint256 tokenid; // 0 usda 1 dai 2 usdc 3 usdt 4 stable token e.g. frax,mim 5 cvxlp3crv e.g. cvxFrax3Crv,cvxMIM3CRV,cvxcrvFRAX
        uint256 margin;  // the latest lptoken amount. e.g. cvxFrax3CRV
        uint256 borrow;  // usda amount
        uint256 metaThreeCRVAmount; // deposit cvxlptoken amount e.g. cvxFrax3CRV
        uint interestTime; // start calc interest time
}

// 0 frax 1 mim 2 fraxusdc for strategy-uint flag
mapping(address => mapping(uint256 => DepositInfo)) public deposits; // address -> strategy -> DepositInfo

```

并且提供了三个主要的方法:`deposit,repay和deleverage`完成对链上数据的CURD；



选择杠杆倍率后，放杠杆的部分平台将使用USDA通过兑换成对应策略的抵押品(如cvx3crv)

基本操作路径: USDA -> USDT -> 3Crv -> cvx3Crv -> rewards

为了方便用户，提供了USDT/USDC/DAI/FRAX -> 作为输入，帮助其兑换成对应策略的抵押品



## FAQ

Q: `AddressFactory`合约的作用是什么？其中主要的方法`deposit、unstake、withdraw`执行是在什么情况下？

> 1、用户抵押到杠杆平台合约后，平台合约发放杠杆通过代理地址抵押到convex等第三方平台，每个地址都有一个代理地址。
>
> 2、所有杠杆合约部署后都需要在该合约进行注册，同时也要把该合约地址注册到所有杠杆合约中



Q: `LeverageMananger`中定义了链上数据结构，其中包含了初始保证金(margin)和计息时间戳(interestTime)，但是在CURD中没有对应的修改计算过程？

> repay中会对interest和margin产生间接影响



Q: 在整个`leverage`中，`repay all`和`deleverage`操作的处理和结果上有怎样的差别？

> 从处理上，repay是需要提供USDA偿还，但是deleverage是不需要提供USDA



Q:对应leverage类型的资产，在被redeem/liquidation时，该如何操作？

> 其中redeem还存在部分被redeem，此时，该用户的杠杆资产如何处理？
>
> 



Q:如何有效的在测试过程中模拟USDA3Pool的池子?

> 