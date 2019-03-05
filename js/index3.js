/*   闭包   立执行函数   */


(function () {

    /**************************************************添加原型方法************************************************/

    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };
    Array.prototype.sum = function () {
        return this.reduce(
            function (partial, value) {
                return (partial + value);
            });
    };


    /**************************************************元素查找************************************************/

    const searchInput = document.getElementById('search');
    const c = document.getElementById('canvas');
    let ct;
    const w = 1000;
    const h = 1000;
    //固定画布大小
    // c.width = 1000;
    // c.height =1000;
    if (c.getContext) {
        ct = c.getContext('2d');
    } else {
        return false;
    }

    //解决图像模糊的问题
    var getPixelRatio = function (context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };
    let ratio = getPixelRatio(ct);
    // console.log(ratio);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.width = w * ratio;
    c.height = h * ratio;
    ct.scale(ratio, ratio);
    console.log(ratio);


    //中心点
    let ratioW = c.width / (ratio / 0.5);
    let ratioH = c.height / (ratio / 0.5);
    // ct.translate(-c.width/6,-c.height/6);

    //画笔初始参数设置；
    let dataC,
        radius = 8,
        lineWidth = 3,
        oBox = document.getElementById('box');
    let triC = 6;//三角形边长


    /**************************************************数据加载和应用************************************************/

    dataC = dataO.data;
    console.log(dataC);//检验是否读取数据
    let links = dataC.links,
        nodes = dataC.nodes,
        centerNodes = dataC.centerNodes;
    nodes = checkData(nodes);// 去重
    for (let i = 0; i < links.length; i++) {
        if (links[i].startNode == links[i].endNode) {
            links.splice(i, 1);
        }
    }
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

    //邻接矩阵
    let matrix = [];

    function setMatrix() {
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


    }

    setMatrix();
    for (let i = 0; i < nodes.length; i++) {
        // nodes[i].degree = Math.sum(matrix[i]);
        let sum = 0;
        matrix[i].forEach(function (item, index, array) {
            sum += item;
        });
        nodes[i].degree = sum;

    }

    //y网络半径的确定
    let R = nodes.length <= 100 ? 100 : 150;

    // 中心节点的位置的确定
    for (let i = 0; i < centerNodes.length; i++) {
        nodes[checkIndexId(centerNodes[i], nodes)].positionX = ratioW + R * Math.sin(i / centerNodes.length * 2 * Math.PI);
        nodes[checkIndexId(centerNodes[i], nodes)].positionY = ratioH + R * Math.cos(i / centerNodes.length * 2 * Math.PI);
    }

    //求一个度数最多的节点
    let array = [];
    for (let i = 0; i < nodes.length; i++) {
        array.push(matrix[i].sum());
    }
    let MAX_VALUE = Math.max(...array);

    //叶子节点度数等于1位置确定
    for (let i = 0; i < centerNodes.length; i++) {
        let flag = checkIndexId(centerNodes[i], nodes);
        let alpha = Math.atan((ratioW - nodes[flag].positionY) / (ratioH - nodes[flag].positionX));
        let n = 0;//标记
        let outL = 3;//放大系数
        for (let j = 0; j < nodes.length; j++) {
            if (matrix[flag][j] == 1 && nodes[j].degree == 1) {
                let scaleC = outL * (nodes[flag].degree + Math.abs(nodes[flag].degree - MAX_VALUE)) / MAX_VALUE * R;//拉伸系数
                if (nodes[flag].degree != 1) {
                    scaleC = (1 - 2 / nodes[flag].degree) * scaleC;
                } else {
                    scaleC = scaleC / 2;
                }
                let chang = Math.PI / centerNodes.length * n / nodes[flag].degree;
                if (nodes[flag].positionX - c.width / (ratio / 0.5) > 0 && nodes[flag].positionY - ratioH > 0) {
                    if (n % 2) {
                        nodes[j].positionX = ratioW + scaleC * Math.cos(alpha + chang);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha + chang);
                    } else {
                        nodes[j].positionX = ratioW + scaleC * Math.cos(alpha - chang);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha - chang);
                    }
                }
                if (nodes[flag].positionX - c.width / (ratio / 0.5) > 0 && nodes[flag].positionY - ratioH <= 0) {
                    if (n % 2) {
                        nodes[j].positionX = c.width / (ratio / 0.5) + scaleC * Math.cos(alpha - chang);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha - chang);
                    } else {
                        nodes[j].positionX = c.width / (ratio / 0.5) + scaleC * Math.cos(alpha + chang);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha + chang);
                    }
                }
                if (nodes[flag].positionX - c.width / (ratio / 0.5) <= 0 && nodes[flag].positionY - ratioH <= 0) {
                    if (n % 2) {
                        nodes[j].positionX = c.width / (ratio / 0.5) + scaleC * Math.cos(alpha - chang + Math.PI);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha - chang + Math.PI);
                    } else {
                        nodes[j].positionX = c.width / (ratio / 0.5) + scaleC * Math.cos(alpha + chang + Math.PI);
                        nodes[j].positionY = ratioH + scaleC * Math.sin(alpha + chang + Math.PI);
                    }
                }
                if (nodes[flag].positionX - c.width / (ratio / 0.5) <= 0 && nodes[flag].positionY - ratioH > 0) {
                    if (n % 2) {
                        nodes[j].positionX = c.width / (ratio / 0.5) - scaleC * Math.cos(alpha - chang);
                        nodes[j].positionY = ratioH - scaleC * Math.sin(alpha - chang);
                    } else {
                        nodes[j].positionX = c.width / (ratio / 0.5) - scaleC * Math.cos(alpha + chang);
                        nodes[j].positionY = ratioH - scaleC * Math.sin(alpha + chang);
                    }
                }
                n = n + 1;
            }
        }
    }

    //叶子节点度数大于1位置确定
    for (let i = 0; i < nodes.length; i++) {
        if (!checkPoint(i, nodes, centerNodes)) {
            if (matrix[i].sum() > 1) {
                let xL = 0,
                    yL = 0;
                for (let j = 0; j < nodes.length; j++) {
                    if (matrix[i][j] == 1) {
                        xL = xL + nodes[j].positionX;
                        yL = yL + nodes[j].positionY;
                    }
                }
                nodes[i].positionX = xL / matrix[i].sum();
                nodes[i].positionY = yL / matrix[i].sum();
            }
        }
    }

    //初始化绘制网络
    drawing(nodes, links, centerNodes);//绘制图形
    /*******************************************   事件    ************************************************/
    //搜索框事件
    searchInput.onkeydown = function (ev) {
        let e = ev || event;
        if (e && e.keyCode === 13) {
            const idNum = searchInput.value;
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
                // nodes[sq].positionX = x;
                // nodes[sq].positionY = y;

                document.onmousemove = document.onmouseup = null;
                let newTime = (new Date()).getTime();
                if (newTime - oldTime < 200) {
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
            haiLunFun(links, nodes, xd, yd, centerNodes);
        }
    };

    /*******************************************   函数   ************************************************/
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
        console.log('kankan');

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
        drawLine(checkIndex(link.startNode, nodes), checkIndex(link.endNode, nodes), link.count, 'white', 0.5);
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
            console.log('建安街aj');
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
        createElementDiv(nodes[flag].propertyList, flag, nodes, links, centerNodes);
    }

    //创建支付弹跳窗
    function haiLunFun(links, nodes, xd, yd, centerNodes) {
        for (let j = 0; j < links.length; j++) {
            let startNodeId = links[j].startNode;
            let endNodeId = links[j].endNode;
            let startPoint = checkIndex(startNodeId, nodes);
            let endPoint = checkIndex(endNodeId, nodes);
            let a = Math.sqrt(Math.pow(startPoint.positionX - endPoint.positionX, 2) + Math.pow(startPoint.positionY - endPoint.positionY, 2));
            let b = Math.sqrt(Math.pow(startPoint.positionX - xd, 2) + Math.pow(startPoint.positionY - yd, 2));
            let c = Math.sqrt(Math.pow(endPoint.positionX - xd, 2) + Math.pow(endPoint.positionY - yd, 2));
            let p = (a + b + c) / 2;
            let h = 2 * Math.sqrt(p * (p - a) * (p - b) * (p - c)) / a;
            let angleA = Math.acos((a * a + c * c - b * b) / (2 * a * c));
            let angleB = Math.acos((a * a + b * b - c * c) / (2 * a * b));
            if (h < 2 && angleA < Math.PI / 2 && angleB < Math.PI / 2) {
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
        ct.font = 'lighter 10px Arial';
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

    //根据id检测节点索引
    function checkIndexId(id, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (id == nodes[i].id) {
                return i;
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
        ct.lineTo(x + triC * Math.sin(beta - Math.PI / 6), y - triC * Math.cos(beta - Math.PI / 6));
        ct.lineTo(x + triC * Math.cos(alpha - Math.PI / 6), y - triC * Math.sin(alpha - Math.PI / 6));
        ct.lineTo(x, y);
        ct.stroke();
        ct.fill();
    }

    function drawTriangleLB(x, y, alpha, beta) {
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
        ct.lineWidth = lineWidth;
        ct.font = 'lighter 8px Arial';
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

            ct.translate((nodeO.positionX + nodeT.positionX) / 2, (nodeO.positionY + nodeT.positionY) / 2);//移位
            ct.rotate(-(alpha - Math.PI / 2));
            ct.fillText('支付(' + pay + ')', 0, 0);
            ct.rotate((alpha - Math.PI / 2));
            ct.translate(-(nodeO.positionX + nodeT.positionX) / 2, -(nodeO.positionY + nodeT.positionY) / 2);//复位
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
                    // console.log(flagLine);
                    if (flagLine > -1) {
                        drawLine(nodes[i], nodes[flagLine], linkPay, '#666', 0.05);
                    }
                }
            }
        }
        ct.fillStyle = 'red';
    }
})();

