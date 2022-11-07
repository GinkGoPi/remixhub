// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";


// Convext deposit
interface IConvexBooster {
    function deposit(uint256 _pid, uint256 _amount, bool _stake) external returns(bool);
    function deposit(uint256 _amount, bool _lock, address _stakeAddress) external;
    function withdraw(uint256 _pid, uint256 _amount) external returns(bool);
    function withdrawTo(uint256 _pid, uint256 _amount, address _to) external returns(bool);
}

// convex rewards
interface IConvexRewards{
    function pid() external view returns(uint256);
    function withdrawAndUnwrap(uint256 amount, bool claim) external returns(bool);
    function extraRewards(uint256 index) external view returns (address);
    function extraRewardsLength() external view returns (uint256);
    function rewardToken() external view returns (address);

    function balanceOf(address account) external view returns (uint256);
}

contract RewardDistribute {
    using SafeERC20 for IERC20;

    IERC20 public constant MIM3LP3CRV = IERC20(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    IERC20 public constant CRV = IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 public constant CVX = IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    IERC20 public constant ThreeCRV = IERC20(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);

    IConvexBooster public constant baseBooster = IConvexBooster(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    IConvexRewards public constant baseReward = IConvexRewards(0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771);

    // for leverage with convex
    bytes4 constant SIG_BALANCEOF = 0x70a08231;     // balanceOf(address account)
    bytes4 constant SIG_TRANSFER = 0xa9059cbb;      // transfer(address recipient, uint256 amount)
    bytes4 constant SIG_APPROVE = 0x095ea7b3;       // approve(address,uint256)

    uint256 public totalColl;
    mapping(address => uint256) public userColl;

    struct RewardType {
        address reward_token;
        address reward_pool;
        uint128 reward_integral;
        uint128 reward_remaining;
        // mapping(address => uint256) reward_integral_for;
        // mapping(address => uint256) claimable_reward;
    }

    // mapping(address => uint256) public reward_integral_for;
    // mapping(address => uint256) public claimable_reward;

    uint256 public cvx_reward_integral;
    uint256 public cvx_reward_remaining;
    mapping(address => uint256) public cvx_reward_integral_for;
    mapping(address => uint256) public cvx_claimable_reward;

    //rewards
    RewardType[] public rewards;

    address public constant collateralVault = 0xF5BCE5077908a1b7370B9ae04AdC565EBd643966;

    constructor() {
        MIM3LP3CRV.approve(address(baseBooster), type(uint256).max);
    }

    function addRewards() external {
        address mainPool = address(baseReward);

        if (rewards.length == 0) {
            rewards.push(
                RewardType({
                    reward_token: address(CRV),
                    reward_pool: mainPool,
                    reward_integral: 0,
                    reward_remaining: 0
                })
            );
        }

        uint256 extraCount = IConvexRewards(mainPool).extraRewardsLength();
        uint256 startIndex = rewards.length - 1;
        for (uint256 i = startIndex; i < extraCount; i++) {
            address extraPool = IConvexRewards(mainPool).extraRewards(i);
            rewards.push(
                RewardType({
                    reward_token: IConvexRewards(extraPool).rewardToken(),
                    reward_pool: extraPool,
                    reward_integral: 0,
                    reward_remaining: 0
                })
            );
        }
    }

    function rewardLength() external view returns (uint256) {
        return rewards.length;
    }

    function _calcCvxIntegral(address _account, uint256 _balance, uint256 _supply, bool _isClaim) internal {

        uint256 bal = IERC20(address(CVX)).balanceOf(address(this));
        uint256 d_cvxreward = bal - cvx_reward_remaining;
        console.log("---> cvx new", d_cvxreward);

        if (_supply > 0 && d_cvxreward > 0) {
            cvx_reward_integral = cvx_reward_integral + d_cvxreward * 1e20/_supply;
        }
        console.log("---> cvx_reward_integral", cvx_reward_integral);
        
        //update user integrals for cvx
        //do not give rewards to address 0
        if (_account == address(0)) return;
        if (_account == collateralVault) return;

        uint userI = cvx_reward_integral_for[_account];
        console.log("---> userI", userI);

        if(_isClaim || userI < cvx_reward_integral){
            console.log("---> user coll", _balance);
            uint256 receiveable = cvx_claimable_reward[_account] + _balance * (cvx_reward_integral - userI)/1e20;
            console.log("---> receiveable", receiveable);
            if(_isClaim){
                if(receiveable > 0){
                    cvx_claimable_reward[_account] = 0;
                    IERC20(address(CVX)).safeTransfer(_account, receiveable);
                    bal = bal - receiveable;
                }
            }else{
                cvx_claimable_reward[_account] = receiveable;
            }
            cvx_reward_integral_for[_account] = cvx_reward_integral;
        }

        //update reward total
        if(bal != cvx_reward_remaining){
            cvx_reward_remaining = bal;
        }
    }

    function _calcRewardIntegral(uint256 _index, address _account, uint256 _balance, uint256 _supply, bool _isClaim) internal{
        RewardType storage reward = rewards[_index];

        //get difference in balance and remaining rewards
        //getReward is unguarded so we use reward_remaining to keep track of how much was actually claimed
        uint256 bal = IERC20(reward.reward_token).balanceOf(address(this));
        // uint256 d_reward = bal.sub(reward.reward_remaining);

        if (_supply > 0 && bal - reward.reward_remaining > 0) {
            reward.reward_integral = reward.reward_integral + uint128((bal - reward.reward_remaining)* 1e20/_supply);
        }

        console.log("---> reward_integral", reward.reward_integral);
        //update user integrals
        //do not give rewards to address 0
        if (_account == address(0)) return;
        if (_account == collateralVault) return;

        // uint userI = reward.reward_integral_for[_account];
        // if(_isClaim || userI < reward.reward_integral){
        //     if(_isClaim){
        //         uint256 receiveable = reward.claimable_reward[_account] + _balance * (uint256(reward.reward_integral - userI))/1e20;
        //         if(receiveable > 0){
        //             reward.claimable_reward[_account] = 0;
        //             IERC20(reward.reward_token).safeTransfer(_account, receiveable);
        //             bal = bal - receiveable;
        //         }
        //     }else{
        //         reward.claimable_reward[_account] = (reward.claimable_reward[_account] - _balance) * (uint256(reward.reward_integral - userI))/1e20;
        //     }
        //     reward.reward_integral_for[_account] = reward.reward_integral;
        // }

        uint256 receiveable = _balance * uint256(reward.reward_integral)/1e20;
        console.log("---> receiveable", receiveable);
        if(receiveable > 0){
            IERC20(reward.reward_token).safeTransfer(_account, receiveable);
            bal = bal - receiveable;
        }

        //update remaining reward here since balance could have changed if claiming
        if(bal !=  reward.reward_remaining){
            reward.reward_remaining = uint128(bal);
        }
    }

    function _checkpointAndClaim(address _account) internal {

        uint256 supply = totalColl;
        // uint256[2] memory depositedBalance;
        uint256 depositedBalance = userColl[_account]; //only do first slot
        
        // IRewardStaking(convexPool).getReward(address(this), true);
        // IConvexRewards()

        uint256 rewardCount = rewards.length;
        for (uint256 i = 0; i < rewardCount; i++) {
            console.log("==> calc reward + ", i);
           _calcRewardIntegral(i,_account,depositedBalance,supply,true);
        }
        console.log("==> calc cvx");
        _calcCvxIntegral(_account,depositedBalance,supply,true);
    }

    function getPid() external view returns (uint256) {
        return baseReward.pid();
    }

    function getUserBalance() external view {
        uint256 coll = userColl[msg.sender];
        console.log("-> user coll", coll);
        uint256 lptoken = MIM3LP3CRV.balanceOf(msg.sender);
        console.log("-> user lptoken", lptoken);
        uint256 cvx = CVX.balanceOf(msg.sender);
        console.log("-> user cvx", cvx);
        uint256 crv = CRV.balanceOf(msg.sender);
        console.log("-> user crv", crv);
        uint256 threeCrv = ThreeCRV.balanceOf(msg.sender);
        console.log("-> user threeCrv", threeCrv);
    }

    function getBalance() public view {
        console.log("-> total coll", totalColl);
        uint256 lptoken = MIM3LP3CRV.balanceOf(address(this));
        console.log("-> lptoken", lptoken);
        uint256 cvx = CVX.balanceOf(address(this));
        console.log("-> cvx", cvx);
        uint256 crv = CRV.balanceOf(address(this));
        console.log("-> crv", crv);
        uint256 threeCrv = ThreeCRV.balanceOf(address(this));
        console.log("-> threeCrv", threeCrv);
        uint256 staked = baseReward.balanceOf(address(this));
        console.log('--> staked', staked);
    }

    function depositAndStake(uint256 amount) external {
        MIM3LP3CRV.safeTransferFrom(msg.sender, address(this), amount);
        totalColl += amount;
        userColl[msg.sender] += amount;
        getBalance();
        uint256 pid = baseReward.pid();
        console.log("--> pid", pid);
        baseBooster.deposit(pid, amount, true);
        console.log("--> deposit & stake");
        getBalance();
    }

    function convexUnstake(
        uint256 amount, 
        bool claim, 
        address reciever
    ) external returns (uint256 unstakeAmount) {
        // Warning: once withdraw all rewards
        baseReward.withdrawAndUnwrap(amount, claim);

        unstakeAmount = MIM3LP3CRV.balanceOf(address(this));
        // unstakeAmount = newBalance - oldBalance;
        console.log("===> unstake token transfer to vault", unstakeAmount);
        MIM3LP3CRV.transfer(msg.sender, unstakeAmount);

        console.log("== TODO distribute reward ==");
        getBalance();

        if (claim) {
            // _checkpointAndClaim(msg.sender);
            address _account = msg.sender;
            uint256 _collAmount = userColl[_account];
            uint256 _totalColl = totalColl;
            uint256 rewardCount = rewards.length;
            for (uint256 i = 0; i < rewardCount; i++) {
                console.log("==> calc reward + ", i);
            _calcRewardIntegral(i, _account, _collAmount, _totalColl, true);
            }
            console.log("==> calc cvx");
            _calcCvxIntegral(_account, _collAmount, _totalColl,true);
        }

        totalColl -= amount;
        userColl[msg.sender] -= amount;
        
        // uint256 cvxNew = CVX.balanceOf(address(this));
        // uint256 crvNew = CRV.balanceOf(address(this));

        // uint256 rewardCVX = cvxNew - cvxSnap;
        // uint256 rewardCRV = crvNew - crvSnap;
        // CRV.transfer(msg.sender, rewardCRV);
        // CVX.transfer(msg.sender, rewardCVX);
        
        // if (claim) {
        //     // TODO: getReward for vault will be all, how to distribute for users 
        //     // address[] memory rewardTokens = baseReward.extraRewards();
        //     uint256 extraRewardsLength = baseReward.extraRewardsLength();
        //     for(uint i=0; i < extraRewardsLength; i++) {
        //         address vbRewardPool = baseReward.extraRewards(i);
        //         if (vbRewardPool == address(0x0)) {
        //             break;
        //         }
        //         (bool success, bytes memory data) = vbRewardPool.call(abi.encodeWithSelector(SIG_BALANCEOF, address(this)));
        //         require(success && (data.length == 32), "get reward token balanceOf failed.");
        //         uint256 rewardBalance = abi.decode(data, (uint256));
        //         console.log("===> vbRewardPool", vbRewardPool, rewardBalance);
        //         if (rewardBalance > 0) {
        //             (bool ss, bytes memory dd) = vbRewardPool.call(abi.encodeWithSignature("rewardToken()"));
        //             require(ss, "get reward token failed");
        //             address rewardToken = abi.decode(dd, (address));
        //             (bool sss, bytes memory ddd) = rewardToken.call(abi.encodeWithSelector(SIG_BALANCEOF, address(this)));
        //             require(sss, "get reward token failed");
        //             uint256 rwdBal = abi.decode(ddd, (uint256));
        //             console.log("==> rewardToken", rewardToken);
        //             (bool tranferSuccess, bytes memory transferData) = rewardToken.call(abi.encodeWithSelector(SIG_TRANSFER, reciever, rewardBalance));
        //             require(tranferSuccess && (transferData.length == 0 || abi.decode(transferData, (bool))), "reward token transfer failed");
        //         }
        //     }
        // }
    }

    // uint256 public cvx_reward_remain;
    // uint256 public crv_reward_remain;
    // function _calaCvxCrvReward() internal {
    //     uint256 cvxBal = CVX.balanceOf(address(this));
    //     uint256 crvBal = CRV.balanceOf(address(this));

    //     // distribute rate

    // }

    // function _calaExtractReward() internal {
        
    // }

}