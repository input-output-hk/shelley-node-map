#!/bin/bash
# kill and restart jormungandr node (run on cron to ensure logs don't get too large and we get a new selection of peers)

HOME_DIR="/home/scott/"
SELF_NODE_DIR="/home/scott/self-node/"

killall -q "jormungandr"
rm ${SELF_NODE_DIR}blocks.log
${HOME_DIR}.cargo/bin/jormungandr --config ${SELF_NODE_DIR}config.yaml --genesis-block-hash 65a9b15f82619fffd5a7571fdbf973a18480e9acf1d2fddeb606ebb53ecca839 --secret ${SELF_NODE_DIR}pool-secret1.yaml | grep --line-buffered -i "block_events" | tee -a ${SELF_NODE_DIR}blocks.log