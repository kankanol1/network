/*   闭包   立执行函数   */


(function () {


    /**************************************************添加原型方法************************************************/

    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };
    Array.prototype.sum = function () {
        return this.reduce(function (partial, value) {
            return partial + value;
        });
    };

    /**************************************************元素查找************************************************/

    const searchInput = document.getElementById('search');
    const inputRandom = document.getElementById('random');
    const inputCross = document.getElementById('cross');
    const oButton = document.querySelectorAll('.inp');
    const inputSymmetric = document.getElementById('symmetric');
    const w = 1000;
    const h = 1000;

    const c = document.getElementById('canvas');
    let ct;
    //固定画布大小
    // c.width = 1000;
    // c.height =1000;
    if (c.getContext) {
        // ct = c.getContext('2d');
        ct = c.getContext('2d');
    } else {
        return false;
    }

    //解决图像模糊的问题
    let getPixelRatio = function (context) {
        let backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };
    let ratio = getPixelRatio(ct);
    
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.width = w * ratio;
    c.height = h * ratio;
    ct.scale(ratio, ratio);

    //画笔初始参数设置；
    let dataC,
        radius = 8,
        lineWidth = 3,
        oBox = document.getElementById('box');
    let triC = 4;//三角形边长
    let dis = 0;//标题高度


    /**************************************************数据加载和应用************************************************/

    dataC = dataO.data;
    // console.log(dataC);//检验是否读取数据
    let links = dataC.links,
        nodes = dataC.nodes,
        centerNodes = dataC.centerNodes;
    nodes = checkData(nodes);// 去重
    let R = nodes.length <= 100 ? 300 : 400;
    //添加基本常数初始数据
    for (let i = 0; i < nodes.length; i++) {
        let flag = 0;
        nodes[i].index = 0;
        for (let j = 0; j < centerNodes.length; j++) {
            if (nodes[i].id == centerNodes[j]) {
                flag = 1;
            }
        }
        if (flag) {
            nodes[i].radius = radius;
            nodes[i].lineWidth = lineWidth;
        } else {
            nodes[i].radius = radius * 0.5;
            nodes[i].lineWidth = lineWidth * 0.5;
        }
    }
    let nodesSection = nodes;// 备份

    //去除异常 数据
    for (let i = 0; i < links.length; i++) {
        if (links[i].startNode == links[i].endNode) {
            links.splice(i, 1);
        }
    }

    //邻接矩阵
    function setMatrix(nodes) {
        // console.log(nodes);
        let matrix = [];

        for (let i = 0; i < nodes.length; i++) {

            matrix[i] = [];
            for (let j = 0; j < nodes.length; j++) {
                matrix[i][j] = 0;
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                for (let k = 0; k < links.length; k++) {
                    if (nodes[i].id == links[k].startNode && nodes[j].id == links[k].endNode) {
                        matrix[i][j] = 1;
                        matrix[j][i] = 1;
                    }
                }
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            // nodes[i].degree = Math.sum(matrix[i]);
            let sum = 0;
            matrix[i].forEach(function (item, index, array) {
                sum += item;
            });
            nodes[i].degree = sum;
        }
        return matrix;
    }

    //初始化绘制网络
    methodRandom(nodesSection);
    drawing(nodes, links, centerNodes);//绘制图形

    /*******************************************   事件    ************************************************/
    //ommouse事件
    //css3 定义

    //分布事件
    inputRandom.addEventListener('click', function () {
        // setMatrix();

        methodRandom(nodesSection);
        drawing(nodes, links, centerNodes);//绘制图形
        //搜索框事件
    });
    inputCross.addEventListener('click', function () {
        // setMatrix();
        methodCross(nodesSection);
        drawing(nodes, links, centerNodes);//绘制图形
        //搜索框事件
    });
    inputSymmetric.addEventListener('click', function () {
        // setMatrix();
        methodSymmetric(nodesSection);
        drawing(nodes, links, centerNodes);//绘制图形
        //搜索框事件
    });
    //搜索框事件
    searchInput.onkeydown = function (ev) {
        let e = ev || event;
        if (e.keyCode == 13) {
            const idNum = searchInput.value;
            // console.log(idNum);//测试
            let flag = -1;
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id == idNum) {
                    flag = i;
                }
            }
            if (flag > -1) {
                // console.log(idNum);
                ct.beginPath();
                ct.fillStyle = 'red';
                ct.arc(nodes[flag].positionX, nodes[flag].positionY, radius * 0.5, 0, Math.PI * 2);
                ct.fill();
            } else {
                alert('请核对id！');
            }
        }
    };

    //按钮
    let markButton = 0;
    oButton[markButton].style.backgroundColor = 'red';
    for (let i = 0; i < oButton.length; i++) {

        oButton[i].addEventListener('click', function () {
            this.index = i;
            oButton[markButton].style.backgroundColor = '#493bff';
            this.style.backgroundColor = 'red';
            markButton = this.index;
        });
    }

    //点击事件
    c.onmousedown = function (ev) {
        //清除弹跳框
        clearInfoBox();
        let oldTime = (new Date()).getTime();
        let ed = ev || event;
        let xd = ed.clientX - c.getBoundingClientRect().left;
        let yd = ed.clientY - c.getBoundingClientRect().top;
        let sq = -1;
        for (let i = 0; i < nodes.length; i++) {
            let sqVal = Math.sqrt(Math.pow(xd - nodes[i].positionX, 2) + Math.pow(yd - nodes[i].positionY, 2));
            if (sqVal < radius + lineWidth) {
                sq = i;
                break;//查找第一个满足点击点的数据索引值
            }
        }
        if (sq > -1) {
            document.onmousemove = function (ev) {
                let em = ev || event;
                let xm = em.clientX - c.getBoundingClientRect().left;
                let ym = em.clientY - c.getBoundingClientRect().top;
                nodes[sq].positionX = xm;
                nodes[sq].positionY = ym;
                ct.clearRect(0, 0, c.width, c.height);
                drawing(nodes, links, centerNodes);
            };
            document.onmouseup = function (ev) {
                var event = ev || event;
                var x = event.clientX - c.getBoundingClientRect().left;
                var y = event.clientY - c.getBoundingClientRect().top;
                document.onmousemove = document.onmouseup = null;
                let newTime = (new Date()).getTime();
                if (newTime - oldTime < 250) {
                    ct.clearRect(0, 0, c.width, c.height);
                    drawing(nodes, links, centerNodes);
                    if (oBox.getElementsByClassName('insert').length) {
                        for (let s = 0; s < oBox.getElementsByClassName('insert').length; s++) {
                            oBox.removeChild(oBox.getElementsByClassName('insert')[s]);
                        }
                    }

                    checkC(x, y, nodes, centerNodes, sq);
                }
            };
        }
        else {
            // console.log('kankan');
            haiLunFun(links, nodes, xd, yd, centerNodes);
        }
    };


    /*******************************************   函数   ************************************************/

    //随即分布
    function methodRandom(nodesSection) {

        nodes = nodesSection;
        let matrix = setMatrix(nodesSection);
        for (let i = 0; i < nodes.length; i++) {
            // nodes[i].degree = Math.sum(matrix[i]);
            let sum = 0;
            matrix[i].forEach(function (item, index, array) {
                sum += item;
            });
            nodes[i].degree = sum;
        }

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].positionX = c.width / 2 - c.width / 6 + R * Math.cos(i / nodes.length * 2 * Math.PI);
            nodes[i].positionY = c.height / 2 - c.width / 6 + dis + R * Math.sin(i / nodes.length * 2 * Math.PI);
        }

    }

    //减少交叉边
    function methodCross(nodesSection) {
        nodes = nodesSection;
        let nodesData = [];
        let matrixV = setMatrix(nodesSection);
        for (let i = 0; i < nodes.length; i++) {
            // nodes[i].degree = Math.sum(matrix[i]);
            let sum = 0;
            matrixV[i].forEach(function (item, index, array) {
                sum += item;
            });
            nodes[i].degree = sum;
        }
        for (let i = 0; i < nodes.length; i++) {
            if (checkPoint(i, nodes, centerNodes)) {
                nodesData.push(nodes[i]);
                for (let j = 0; j < nodes.length; j++) {
                    if (matrixV[i][j]) {
                        nodesData.push(nodes[j]);
                        for (let k = 0; k < nodes.length; k++) {
                            matrixV[k][j] = 0;
                            matrixV[j][k] = 0;
                        }
                    }
                }
            }
        }
        nodes = nodesData;
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].positionX = c.width / 2 - c.width / 6 + R * Math.cos(i / nodes.length * 2 * Math.PI);
            nodes[i].positionY = c.height / 2 - c.width / 6 + dis + R * Math.sin(i / nodes.length * 2 * Math.PI);
        }
    }

    //增加对称性
    function methodSymmetric(nodesSection) {
        nodes = nodesSection;
        let matrix = setMatrix(nodesSection);
        for (let i = 0; i < nodes.length; i++) {
            // nodes[i].degree = Math.sum(matrix[i]);
            let sum = 0;
            matrix[i].forEach(function (item, index, array) {
                sum += item;
            });
            nodes[i].degree = sum;
        }
        let nodesData = [];
        for (let i = 0; i < nodes.length; i++) {
            if (checkPoint(i, nodes, centerNodes)) {
                let degree = 0;
                for (let j = 0; j < nodes.length; j++) {
                    if (matrix[i][j]) {
                        // console.log(matrixV[i][j]);
                        nodesData.push(nodes[j]);
                        degree++;
                        for (let k = 0; k < nodes.length; k++) {
                            matrix[k][j] = 0;
                            matrix[j][k] = 0;
                        }
                    }
                }
                nodesData.insert(Math.round(nodesData.length - degree / 2), nodes[i]);
            }
        }
        nodes = nodesData;
        // console.log(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].positionX = c.width / 2 - c.width / 6 + R * Math.cos(i / nodes.length * 2 * Math.PI);
            nodes[i].positionY = c.height / 2 - c.width / 6 + dis + R * Math.sin(i / nodes.length * 2 * Math.PI);
        }
    }

    //清除弹跳框
    function clearInfoBox() {
        if (oBox.querySelector('.insert')) {
            let oDiv = oBox.querySelector('.insert');
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
            oBox.removeChild(oDiv);
        }
        if (oBox.querySelector('.pay')) {
            let oDiv = oBox.querySelector('.pay');
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
            oBox.removeChild(oDiv);
        }
    }

    //创建div显示企业的详细信息
    function createElementDiv(dataInfo, m, nodes, links, centerNodes) {
        let num = dataInfo.degree;
        dataInfo = dataInfo.propertyList;
        if (oBox.querySelector('.insert')) {
            let oDiv = oBox.querySelector('.insert');
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
            oBox.removeChild(oDiv);
        }
        if (oBox.querySelector('.pay')) {
            let oDiv = oBox.querySelector('.pay');
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
            oBox.removeChild(oDiv);
        }
        let oDiv;
        oDiv = document.createElement('div');
        oDiv.className = 'insert';
        if (dataInfo.name) {
            // console.log(dataInfo);
            const h4 = document.createElement('h4');
            const p = document.createElement('p');
            h4.innerHTML = dataInfo.name + '<a href="http://www.gl-data.com/">查看详细信息>></a>';
            p.innerHTML = '名称：' + '<span>' + dataInfo.name + '</span>';
            const hr = document.createElement('hr');
            oDiv.appendChild(h4);
            oDiv.appendChild(hr);
            oDiv.appendChild(p);
        }
        if (dataInfo.ctype) {
            const p = document.createElement('p');
            p.innerHTML = '性质：' + '<span>' + dataInfo.ctype + '</span>';
            oDiv.appendChild(p);
        }
        if (dataInfo.id) {
            const p = document.createElement('p');
            p.innerHTML = 'ID：' + '<span>' + dataInfo.id + '</span>';
            oDiv.appendChild(p);
        }
        if (dataInfo.type) {
            const p = document.createElement('p');
            p.innerHTML = '类型：' + '<span>' + dataInfo.type + '</span>';
            oDiv.appendChild(p);
        }
        if (num) {
            const p = document.createElement('p');
            p.innerHTML = '付款单位个数：' + '<span>' + num + '</span>';
            oDiv.appendChild(p);
        }
        if (dataInfo.state) {
            const p = document.createElement('p');
            p.innerHTML = '公司状态：' + '<span>' + dataInfo.state + '</span>';
            oDiv.appendChild(p);
        }
        if (dataInfo.time) {
            const p = document.createElement('p');
            p.innerHTML = '注册时间：' + '<span>' + dataInfo.time + '</span>';
            oDiv.appendChild(p);
        }
        oDiv.style.left = nodes[m].positionX + 10 + 'px';
        oDiv.style.top = nodes[m].positionY + 10 + 'px';
        // console.log('kakka');

        oDiv.addEventListener('click', function () {
            console.log('kankan');
            oBox.removeChild(oDiv);
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
        });
        oBox.appendChild(oDiv);
    }

    //创建div显示企业支付关系div
    function createElementPay(link, nodes, x, y, centerNodes) {
        // ct.clearRect(0,0,c.width,c.height);
        // drawing(nodes,links,centerNodes);//绘制图形
        drawLine(checkIndex(link.startNode, nodes), checkIndex(link.endNode, nodes), link.count, '#fff', 0.5);
        drawLine(checkIndex(link.startNode, nodes), checkIndex(link.endNode, nodes), link.count, 'red', 0.5);
        let oDiv = document.createElement('div');
        oDiv.className = 'pay';
        let h4 = document.createElement('h4');
        h4.innerHTML = '支付关系';
        let hr = document.createElement('hr');
        oDiv.appendChild(h4);
        oDiv.appendChild(hr);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id == link.endNode) {
                let p = document.createElement('p');
                p.innerHTML = '收款方：' + '<span>' + nodes[i].name + '</span>';
                oDiv.appendChild(p);
            }
            if (nodes[i].id == link.startNode) {
                let p = document.createElement('p');
                p.innerHTML = '付款方：' + '<span>' + nodes[i].name + '</span>';
                oDiv.appendChild(p);
            }

        }
        if (link.count) {
            let p = document.createElement('p');
            p.innerHTML = '支付次数：' + '<span>' + link.count + '</span>';
            oDiv.appendChild(p);
        }
        oDiv.style.left = x + 'px';
        oDiv.style.top = y + 'px';
        oDiv.addEventListener('click', function () {
            oBox.removeChild(oDiv);
            ct.clearRect(0, 0, c.width, c.height);
            drawing(nodes, links, centerNodes);
            // console.log('建安街aj');
        });
        oBox.appendChild(oDiv);
    }

    //判断点击位置和节点的距离
    function checkC(x, y, nodes, centerNodes, flag) {
        if (checkPoint(flag, nodes, centerNodes)) {
            console.log('kankan');
            ct.beginPath();
            ct.strokeStyle = '#dd63c5';
            ct.lineWidth = 3;
            ct.arc(nodes[flag].positionX, nodes[flag].positionY, nodes[flag].radius, 0, Math.PI * 2);
            ct.stroke();
        } else {
            ct.beginPath();
            ct.strokeStyle = '#0f0';
            ct.arc(nodes[flag].positionX, nodes[flag].positionY, nodes[flag].radius, 0, Math.PI * 2);
            ct.stroke();
        }
        createElementDiv(nodes[flag], flag, nodes, links, centerNodes);
    }

    //创建支付弹跳窗
    function haiLunFun(links, nodes, xd, yd, centerNodes) {
        for (let j = 0; j < links.length; j++) {
            // ct.clearRect(0,0,c.width,c.height);
            // drawing(nodes,links,centerNodes);//绘制图形
            let startNodeId = links[j].startNode;
            let endNodeId = links[j].endNode;
            let startPoint = checkIndex(startNodeId, nodes);
            let endPoint = checkIndex(endNodeId, nodes);
            // console.log(startPoint,endPoint);
            // console.log(links[j]);


            let a = Math.sqrt(Math.pow(startPoint.positionX - endPoint.positionX, 2) + Math.pow(startPoint.positionY - endPoint.positionY, 2));
            let b = Math.sqrt(Math.pow(startPoint.positionX - xd, 2) + Math.pow(startPoint.positionY - yd, 2));
            let c = Math.sqrt(Math.pow(endPoint.positionX - xd, 2) + Math.pow(endPoint.positionY - yd, 2));
            let p = (a + b + c) / 2;
            let h = 2 * Math.sqrt(p * (p - a) * (p - b) * (p - c)) / a;
            let angleA = Math.acos((a * a + c * c - b * b) / (2 * a * c));
            let angleB = Math.acos((a * a + b * b - c * c) / (2 * a * b));
            if (h < 2 && angleA < Math.PI / 2 && angleB < Math.PI / 2) {
                console.log(links[j]);
                // ct.lineWidth = 1;
                createElementPay(links[j], nodes, xd, yd, centerNodes);
                break;
            }
        }
    }

    //剔除重复数据
    function checkData(data) {
        let newData = [];
        for (let i = 0; i < data.length; i++) {
            let flag = 0;
            for (let j = i + 1; j < data.length; j++) {
                if (data[i].id == data[j].id) {
                    flag = 1;
                }
            }
            if (flag == 0) {
                newData.push(data[i]);
            }
        }
        return newData;
    }

    /*px:点的x坐标
      py:点的y坐标
      r:半径
      lw:线宽
      n:节点索引*/

    //绘制中心节点
    function drawingC(px, py, r, lw, n, nodes) {
        ct.beginPath();
        ct.lineWidth = lw;
        ct.fillStyle = '#ffea17';
        ct.strokeStyle = '#0f0';
        ct.arc(px, py, r, 0, Math.PI * 2);
        ct.fill();
        ct.stroke();
        setFont();//设置字体
        // console.log(nodes[n].propertyList.name.length);
        if (nodes[n].propertyList.name.length < 5) {
            ct.fillText(nodes[n].propertyList.name, px, py - r - 12);

        } else {
            ct.fillText(nodes[n].propertyList.name.slice(0, 5) + '...', px, py - r - 12);
        }
        // ct.fillStyle = '#fff';

    }

    //绘制叶子节点
    function drawingN(px, py, r, lw, n, nodes) {
        ct.beginPath();
        ct.lineWidth = lw;
        ct.fillStyle = '#00f';
        ct.strokeStyle = '#fff';
        ct.arc(px, py, r, 0, Math.PI * 2);
        ct.fill();
        ct.stroke();
        setFont();//设置字体
        if (nodes[n].propertyList.name.length < 5) {
            ct.fillText(nodes[n].propertyList.name, px, py - r - 12);

        } else {
            ct.fillText(nodes[n].propertyList.name.slice(0, 5) + '...', px, py - r - 12);

        }
        // ct.fillStyle = '#fff';

    }

    //字体设置
    function setFont() {
        ct.fillStyle = '#000';
        ct.font = 'lighter 10px Verdana';
        ct.textAlign = 'center';
        ct.textBaseline = 'middle';
    }

    //判断节点是否为中心节点
    function checkPoint(n, nodes, centerNodes) {
        let flag = 0;
        for (let i = 0; i < centerNodes.length; i++) {
            if (nodes[n].id == centerNodes[i]) {
                flag = 1;
            }
        }
        return flag;
    }

    //根据id检测节点索引
    function checkIndex(id, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (id == nodes[i].id) {
                return nodes[i];
            }
        }
    }

    //绘制箭头
    function drawTriangleRB(x, y, alpha, beta) {
        ct.lineTo(x + triC * Math.cos(beta - Math.PI / 6), y + triC * Math.sin(beta - Math.PI / 6));
        ct.lineTo(x + triC * Math.sin(alpha - Math.PI / 6), y + triC * Math.cos(alpha - Math.PI / 6));
        ct.lineTo(x, y);
        ct.stroke();
        ct.fill();
    }

    function drawTriangleRT(x, y, beta, alpha) {
        // ct.strokeStyle = '#666';
        // ct.fillStyle = '#666';
        ct.lineTo(x + triC * Math.sin(beta - Math.PI / 6), y - triC * Math.cos(beta - Math.PI / 6));
        ct.lineTo(x + triC * Math.cos(alpha - Math.PI / 6), y - triC * Math.sin(alpha - Math.PI / 6));
        ct.lineTo(x, y);
        ct.stroke();
        ct.fill();
    }

    function drawTriangleLB(x, y, alpha, beta) {
        // ct.strokeStyle = '#666';
        // ct.fillStyle = '#666';
        ct.lineTo(x - triC * Math.cos(beta - Math.PI / 6), y + triC * Math.sin(beta - Math.PI / 6));
        ct.lineTo(x - triC * Math.sin(alpha - Math.PI / 6), y + triC * Math.cos(alpha - Math.PI / 6));
        ct.lineTo(x, y);
        ct.stroke();
        ct.fill();
    }

    function drawTriangleLT(x, y, alpha, beta) {
        ct.lineTo(x - triC * Math.cos(beta - Math.PI / 6), y - triC * Math.sin(beta - Math.PI / 6));
        ct.lineTo(x - triC * Math.sin(alpha - Math.PI / 6), y - triC * Math.cos(alpha - Math.PI / 6));
        ct.lineTo(x, y);
        ct.stroke();
        ct.fill();
    }

    //绘制连线
    function drawLine(nodeO, nodeT, pay, color, lineWidth) {
        ct.beginPath();
        ct.font = 'lighter 8px MingLiU';
        ct.lineWidth = lineWidth;
        ct.strokeStyle = color;
        ct.fillStyle = color;
        let mdx = Math.abs(nodeO.positionX + nodeT.positionX) / 2;
        let mdy = Math.abs(nodeO.positionY + nodeT.positionY) / 2;
        let alpha = Math.atan(Math.abs(nodeO.positionX - nodeT.positionX) / Math.abs(nodeO.positionY - nodeT.positionY));
        let beta = Math.atan(Math.abs(nodeO.positionY - nodeT.positionY) / Math.abs(nodeO.positionX - nodeT.positionX));
        let textL = 20;
        if (nodeO.positionX > nodeT.positionX && nodeO.positionY > nodeT.positionY) {
            ct.moveTo(nodeO.positionX - Math.cos(beta) * (radius + 5), nodeO.positionY - Math.sin(beta) * (radius + 5));
            ct.lineTo(mdx + Math.sin(alpha) * textL, mdy + Math.cos(alpha) * textL);
            ct.moveTo(mdx - Math.sin(alpha) * textL, mdy - Math.cos(alpha) * textL);
            ct.lineTo(nodeT.positionX + Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY + Math.cos(alpha) * (radius + 5) * 0.5);
            drawTriangleRB(nodeT.positionX + Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY + Math.cos(alpha) * (radius + 5) * 0.5, alpha, beta);
            ct.translate((nodeO.positionX + nodeT.positionX) / 2, (nodeO.positionY + nodeT.positionY) / 2);
            ct.rotate(-(alpha - Math.PI / 2));
            ct.fillText('支付(' + pay + ')', 0, 0);
            ct.rotate((alpha - Math.PI / 2));
            ct.translate(-(nodeO.positionX + nodeT.positionX) / 2, -(nodeO.positionY + nodeT.positionY) / 2);
        }
        if (nodeO.positionX > nodeT.positionX && nodeO.positionY <= nodeT.positionY) {
            ct.moveTo(nodeO.positionX - Math.cos(beta) * (radius + 5), nodeO.positionY + Math.sin(beta) * (radius + 5));
            ct.lineTo(mdx + Math.sin(alpha) * textL, mdy - Math.cos(alpha) * textL);
            ct.moveTo(mdx - Math.sin(alpha) * textL, mdy + Math.cos(alpha) * textL);
            ct.lineTo(nodeT.positionX + Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY - Math.cos(alpha) * (radius + 5) * 0.5);
            drawTriangleRT(nodeT.positionX + Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY - Math.cos(alpha) * (radius + 5) * 0.5, alpha, beta);
            ct.translate((nodeO.positionX + nodeT.positionX) / 2, (nodeO.positionY + nodeT.positionY) / 2);
            ct.rotate(alpha - Math.PI / 2);
            ct.fillText('支付(' + pay + ')', 0, 0);
            ct.rotate(-(alpha - Math.PI / 2));
            ct.translate(-(nodeO.positionX + nodeT.positionX) / 2, -(nodeO.positionY + nodeT.positionY) / 2);
        }
        if (nodeO.positionX <= nodeT.positionX && nodeO.positionY > nodeT.positionY) {
            ct.moveTo(nodeO.positionX + Math.cos(beta) * (radius + 5), nodeO.positionY - Math.sin(beta) * (radius + 5));
            ct.lineTo(mdx - Math.sin(alpha) * textL, mdy + Math.cos(alpha) * textL);
            ct.moveTo(mdx + Math.sin(alpha) * textL, mdy - Math.cos(alpha) * textL);
            ct.lineTo(nodeT.positionX - Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY + Math.cos(alpha) * (radius + 5) * 0.5);
            drawTriangleLB(nodeT.positionX - Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY + Math.cos(alpha) * (radius + 5) * 0.5, alpha, beta);
            ct.translate((nodeO.positionX + nodeT.positionX) / 2, (nodeO.positionY + nodeT.positionY) / 2);
            ct.rotate(alpha - Math.PI / 2);
            ct.fillText('支付(' + pay + ')', 0, 0);
            ct.rotate(-alpha + Math.PI / 2);
            ct.translate(-(nodeO.positionX + nodeT.positionX) / 2, -(nodeO.positionY + nodeT.positionY) / 2);
        }
        if (nodeO.positionX <= nodeT.positionX && nodeO.positionY <= nodeT.positionY) {
            ct.moveTo(nodeO.positionX + Math.cos(beta) * (radius + 5), nodeO.positionY + Math.sin(beta) * (radius + 5));
            ct.lineTo(mdx - Math.sin(alpha) * textL, mdy - Math.cos(alpha) * textL);
            ct.moveTo(mdx + Math.sin(alpha) * textL, mdy + Math.cos(alpha) * textL);
            ct.lineTo(nodeT.positionX - Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY - Math.cos(alpha) * (radius + 5) * 0.5);
            drawTriangleLT(nodeT.positionX - Math.sin(alpha) * (radius + 5) * 0.5, nodeT.positionY - Math.cos(alpha) * (radius + 5) * 0.5, alpha, beta);
            ct.translate((nodeO.positionX + nodeT.positionX) / 2, (nodeO.positionY + nodeT.positionY) / 2);
            ct.rotate(-(alpha - Math.PI / 2));
            ct.fillText('支付(' + pay + ')', 0, 0);
            ct.rotate(alpha - Math.PI / 2);
            ct.translate(-(nodeO.positionX + nodeT.positionX) / 2, -(nodeO.positionY + nodeT.positionY) / 2);
        }
        ct.stroke();
        ct.fill();
        ct.lineWidth = 3;
    }

    //绘制图形
    function drawing(nodes, links, centerNodes) {
        ct.clearRect(0, 0, c.width, c.height);
        // setTitle();
        // ct.fillText('政企支付关系网络',c.width/2,40);
        for (let i = 0; i < nodes.length; i++) {
            if (checkPoint(i, nodes, centerNodes)) {
                drawingC(nodes[i].positionX, nodes[i].positionY, nodes[i].radius, nodes[i].lineWidth, i, nodes);
            } else {
                drawingN(nodes[i].positionX, nodes[i].positionY, nodes[i].radius, nodes[i].lineWidth, i, nodes);
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < links.length; j++) {
                let id = links[j].id.split('-');
                let idF = id[0];
                let idL = id[2];
                let linkPay = links[j].count;
                let flagLine = -1;
                if (nodes[i].id.toString() == idF) {
                    // console.log('是否是中心点');
                    for (let k = 0; k < nodes.length; k++) {
                        if (nodes[k].id.toString() == idL) {
                            flagLine = k;
                        }
                    }
                    if (flagLine > -1) {
                        drawLine(nodes[i], nodes[flagLine], linkPay, '#000', 0.05);
                    }
                }
            }
        }
        ct.fillStyle = 'red';
    }
})();

