from email.mime import base
import time
import pandas as pd

DECIMAL_PRECISION = 1e18
SECONDS_IN_ONE_MINUTE = 60
# (1/2) = d^720 => d = (1/2)^(1/720)
MINUTE_DECAY_FACTOR = 999037758833783000

BETA = 2
# 0.5%
BORROWING_FEE_FLOOR = DECIMAL_PRECISION / 1000 * 5
# 5%
MAX_BORROWING_FEE = DECIMAL_PRECISION / 100 * 5

# 0.5%
REDEMPTION_FEE_FLOOR = DECIMAL_PRECISION / 1000 * 5

baseRate = 0
print(f'init baseRate: {baseRate}')

lastFeeOperationTime = pd.Timestamp('2022-07-08 00:00:00').timestamp()
print(f'init lastFeeOperationTime: {lastFeeOperationTime}')


def get_borrow_rate():
    return _calc_borrow_rate(baseRate)

def _calc_borrow_rate(baserate):
    return min(BORROWING_FEE_FLOOR + baserate, MAX_BORROWING_FEE)

def decay_baserate_from_borrow(minutes):
    decay_baserate = _calc_decayed_baserate(minutes)
    assert(decay_baserate <= DECIMAL_PRECISION)
    
    global baseRate
    baseRate = int(decay_baserate)
    _update_last_feeOpTime()
    return baseRate
    
def _update_last_feeOpTime():
    global lastFeeOperationTime
    time_passed = pd.Timestamp.now().timestamp() - lastFeeOperationTime
    if time_passed >= SECONDS_IN_ONE_MINUTE:
        lastFeeOperationTime = pd.Timestamp.now().timestamp()

def _calc_decayed_baserate(minutes_passed):
    # minutes_passed = _minutes_passed_since_LastFeeOp()
    decay_factor = MINUTE_DECAY_FACTOR ** int(minutes_passed)
    return baseRate*decay_factor/DECIMAL_PRECISION

def _minutes_passed_since_LastFeeOp():
    return (pd.Timestamp.now().timestamp() - lastFeeOperationTime) / SECONDS_IN_ONE_MINUTE


def get_redeem_rate():
    global baseRate
    return _calc_redeem_rate(baseRate)
    
def _calc_redeem_rate(baserate):
    return min(REDEMPTION_FEE_FLOOR+baserate, DECIMAL_PRECISION)

def get_redeem_rate_withdecay(minutes):
    return _calc_redeem_rate(_calc_decayed_baserate(minutes))

# def update_baserate_from_redeem(coll, price, totalSupply):
def update_baserate_from_redeem(coll, minutes):
    decayed_baserate = _calc_decayed_baserate(minutes)
    # redeemed_USDA_frac = coll * price / totalSupply
    redeemed_USDA_frac = coll * 999*1e15 / (1e10*1e18)
    
    newbaseRate = decayed_baserate + redeemed_USDA_frac * BETA
    newbaseRate = min(newbaseRate, DECIMAL_PRECISION)
    
    assert newbaseRate > 0
    
    global baseRate
    baseRate = int(newbaseRate)
    
    _update_last_feeOpTime()
    return newbaseRate


borrow_rate = get_borrow_rate()
# 5000000000000000
print(f'init borrow rate: {borrow_rate}')

redeem_rate = get_redeem_rate()
print(f'init borrow rate: {redeem_rate}')

d = _minutes_passed_since_LastFeeOp()
print(d, int(d))

rows = []
# minutes = [10]
minutes = [10, 30, 60, 90, 120, 180, 240, 300, 360, 720]
colls =  [i*1e18 for i in [10, 100, 500, 1000, 5000, 10000, 50000, 100000]]
for minute in minutes:
    for coll in colls:
        rate = update_baserate_from_redeem(coll, minute)
        fee_rate = get_redeem_rate() / 1e18
        fee = coll * fee_rate / 1e18 
        baseRate = 0
        # fees.append(fee)
        row = {'collertal': coll, 'minute': minute, 'fee_rate': fee_rate, 'fee': fee}
        rows.append(row)
        
df = pd.DataFrame(rows)

# print(df.head())

df.to_csv('./notebooks/coll-debt-baserate-fee.csv', index=False)

