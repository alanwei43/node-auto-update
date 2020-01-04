docker run -d \
-e SERVER_PORT=3010 \
-e CONFIG_URL=https://gitee.com/alanway/test-node-web/raw/master/config.json \
--name node-web-test \
-p 3010:3010 \
-p 3005:3005 \
node-auto-update:$1