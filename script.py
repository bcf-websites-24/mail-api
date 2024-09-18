import os


for i in range(0, 15):
    os.system(
        f"doctl compute domain records create buetcsefest2024.com --record-type TXT --record-name mail{i} --record-data 'v=spf1 include:spf.protection.outlook.com -all' --record-ttl 3600"
    )
    os.system(
        f"doctl compute domain records create buetcsefest2024.com --record-type CNAME --record-name selector1-azurecomm-prod-net._domainkey.mail{i} --record-data selector1-azurecomm-prod-net._domainkey.azurecomm.net. --record-ttl 3600"
    )
    os.system(
        f"doctl compute domain records create buetcsefest2024.com --record-type CNAME --record-name selector2-azurecomm-prod-net._domainkey.mail{i} --record-data selector2-azurecomm-prod-net._domainkey.azurecomm.net. --record-ttl 3600"
    )
