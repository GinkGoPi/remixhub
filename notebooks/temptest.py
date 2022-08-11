import math
import re


res = math.log10(math.pow(2, 256))
print(res) # 77

# 1e20 ~ 1e77 => 1e57  N*1e18 1e20
# 1e39 * 1e20 = 1e59
# 1:100

# print(math.log(1e39)) # 89

# 1y = 2U  1:2
# 2y = 1U  2:1

# 100 * 1e20 / (70 * 1) == 1.428e+20

# 70 * 1 / (100 * 1e20) == 0.7e-20

# 80 * 1 * 1e10 / (100 * 1) == 0.8e+10
# 800/1000

# 1 / 1000

# 1e18
# 0.1/100000000000


"""
111111111111111111111   900

125000000000000000000   800

147058823529411764705   680

250000000000000000000   40


0xf911  100/40     [0xf911, 0x213f]
0x213f  1000/600    [0xf911, 0xf39f]
0xf39f  1000/700    [0x213f, 0x8ba1]
0x8ba1  1000/800    [0xf39f, 0x8ba1]

     
?1000/680 => 
rr => 0xf911
2f => 0xf911

1000 

100e18/2
16e17
5e18
1052631578947368421
500000000000000000000
1091894614900000000000
114186504123821385

173346200000000000000000

1100000000000000000
1052631578947368421

0x000:00
0x001:01
0x002:01
0x001:02
0x003:01
0x000:00
0x5b38da6a701c568545dcfcb03fcb875f56beddc4010000000000000000000000
0x5b38da6a701c568545dcfcb03fcb875f56beddc4010000000000000000000000
0x5b38da6a701c568545dcfcb03fcb875f56beddc401
0x0000000000000000000000000000000000000000000000000000000000000000

142499999999999999
159951712854385580340
1122468160381653203250

900000000000000000000
1100000000000000000000
2000000000000000000000
"""

k = 16

print(math.sqrt(k))

print(math.log(k))

"""
a => c
c => d

==> a, b
a => b
b => c
c => d
2404721937260164061
1100000000000000000
99881398
100001100
1008133618229933022
100693795159603995683724756
993109851917843591
1e44 / 1e27 = 1e17

18 + 18 + 8 = 44

46983336910715

1021630986740106076  * 99918111

1.0207

115194201551

0xA => debt=10 coll=9 arrayIndex=0
0xB => debt=10 coll=9 arrayIndex=1
0xC => debt=100 coll=80 arrayIndex=2
oxD => debt=100 coll=90 arrayIndex=3
oxE => debt=100 coll=90 arrayIndex=4

1100000000000000000000
2271339186050483390254
1100000000000000000000
950000000000000000000
1100000000000000000000
11020568588308992674
1091036290242590274795

nohup /opt/homebrew/Caskroom/miniforge/base/bin/python /Users/apple/workspace/Bitbucket/redeem/research/Abraca/track_coll_price.py &
"""


def render_request():
    from requests_html import HTMLSession
    from lxml import etree
    
    url = 'https://abracadabra.money/borrow/25'
    priceXpath = '//*[@id="app"]/div[1]/div/div[2]/div[3]/div/div[5]/span[2]/text()'
    # priceXpath = '//*[@class="info-list"]/div[5]/text()'
    # priceXpath = '/html/body/div[1]/div[1]/div/div[2]/div[3]/div/div[5]/span[2]'

    Headers = {
        # 'Referer': referer,
        # 'Cookie': "Cookie: __cuid=c91178555ee748eda8cb0d7d26ab5212; amp_fef1e8=c3f0f66c-b327-41e1-bdfc-976a53894fe4R...1g6k22k9k.1g6k22kc7.1.1.2",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36'
    }
    
    mycookie = ""

    session = HTMLSession()
    
    resp = session.get(url, headers=Headers, cookies=mycookie)
    resp.html.render()
    
    text = resp.html.html
    print(text[-1000:])

    html = etree.HTML(text)
    price_list = html.xpath(priceXpath)
    print(f'--> price {price_list}')
    
# render_request()

def webdriver_request():
    """
    --remote-debugging-port=9222 --user-data-dir=/Users/apple/Desktop/Temp/Chrome/
    """
    import time
    from lxml import etree
    from selenium import webdriver

    url = 'https://abracadabra.money/borrow/25'
    priceXpath = '//*[@id="app"]/div[1]/div/div[2]/div[3]/div/div[5]/span[2]/text()'
    # priceXpath = '//*[@class="info-list"]/div[5]/text()'
    # priceXpath = '/html/body/div[1]/div[1]/div/div[2]/div[3]/div/div[5]/span[2]'

    Headers = {
        # 'Referer': referer,
        'Cookie': "Cookie: __cuid=c91178555ee748eda8cb0d7d26ab5212; amp_fef1e8=c3f0f66c-b327-41e1-bdfc-976a53894fe4R...1g6k22k9k.1g6k22kc7.1.1.2",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36'
    }

    driver_path = '/opt/homebrew/Caskroom/miniforge/base/bin/chromedriver'

    # browser = webdriver.Chrome(driver_path)
    
    option = webdriver.ChromeOptions()
    # option.add_argument("--user-data-dir="+"/Users/apple/Desktop/Temp/Chrome/")
    option.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    browser = webdriver.Chrome(driver_path, chrome_options=option)

    # browser.get(url)
    browser.refresh()
    time.sleep(60)
    text = browser.page_source
    print(text[-100:])
    
    html = etree.HTML(text)
    price_list = html.xpath(priceXpath)
    print(f'--> price {price_list}')
    
    with open('abrachrome.html', 'w') as fw:
        fw.write(text)

    # browser.close()

# webdriver_request()


'''
950000000000000000000
4750000000000000000

700000000000000000000
701308910165117715662

1176484274017823557

114186504123821385

1100000000000000000000
5510284294154496337
1096546574536744771132


baseRate = 0.5%
[1] Troves.debt=700 Troves.coll=1000  NPCR=1.42
[2] Troves.debt=700 Troves.coll=1000  NPCR=1.42

price=1:1
    input=>700
    [1] coll=1000 debt=700
    USDALot = min(700, 700) = 700
    collLot = USDALot/price = 700
    newDebt = debt - USDALot = 0
    newColl = coll - collLot = 300
    if newDebt == 0:
        Troves.debt = 0
        Troves.coll = 0
    redeemFee = input*baseRate = 3.5
    getColl = collLot - redeemFee/price = 700 - 3.5/0.8 ≈ 696

price=0.8:1
    input=>1000
    [1] coll=1000 debt=700
    USDALot = min(1000, 700) = 700
    collLot = USDALot/price = 875
    newDebt = debt - USDALot = 0
    newColl = coll - collLot = 125
    if newDebt == 0:
        Troves.debt = 0
        Troves.coll = 0
    redeemFee[1] = USDALot*baseRate = 3.5

    input=>1000 - 700 = 300
    [2] coll=1000 debt = 700
    USDALot = min(300, 700) = 300
    collLot = USDALot/price = 300/0.8 = 375
    newDebt = debt - USDALot = 700-300 = 400
    newColl = coll - collLot = 1000-375 = 625
    if newDebt != 0:
        NPCR = newColl/newDebt = 625/400 ≈ 1.56
        Troves.debt = newDebt = 400
        Troves.coll = newColl = 625
    redeemFee[2] = USDALot*baseRate = 1.5

    redeemFeeSum = redeemFee[1] + redeemFee[2] = 5
    Or with 
    redeemFeeOnce = input*baseRate = 5

    getColl = collLot[1] + collLot[2] - redeemFee/price = 875+625-5/0.8=1493.75


'''

# before redeem owner-USDA: BigNumber { value: "2500000000000000000000" }
# before redeem owner-Coll: BigNumber { value: "0" }
# before redeem Coll-contract: BigNumber { value: "3500000000000000000000" }

# redeem Fee total: 5615349629381119824
# burn USDA: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 200000000000000000000
# -> redeem feeTo: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 collValue: 201387590319207991542
# send coll to redeemer: 195772240689826871718
# -> fees: 1006937951596039957

# after redeem owner-USDA: BigNumber { value: "2300000000000000000000" }
# after redeem owner-Coll: BigNumber { value: "196779178641422911675" }
# after redeem coll-contract: BigNumber { value: "3303220821358577088325" }




