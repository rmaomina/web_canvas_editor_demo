"use strict";

var devGoodsLabelEditor = {
    canvas: null,
    canvasObj: {
        text: null,
        image: null
    },
    canvasConfig: {
        text: '비타 500!!',
        textLimit: 8,
        imageSrc: './assets/images/_default.png',
        labelSrc: null,
        imageScale: 0.71,
        ratio: 1
    },
    initLang: function () {
        // common.lang.load('labelEditor.alert.textLimit', "텍스트는 {limit}자 미만이어야 합니다.");
        // common.lang.load('labelEditor.confirm.reset', "모든 변경사항을 초기화하시겠습니까?");
    },
    initLabelSrc: function() {
        let self = this;
        $('.devModifyText').val(self.canvasConfig.text).focus();
        self.canvasConfig.labelSrc = $('.devLabelImageSrc').data('src');
    },
    initCanvas: function() {
        let self = this;
        
        let canvasSize = self.getCanvasSize();
        let screenRatio = self.setDocumentRatio();

        self.canvas = new fabric.Canvas('c1', {
            width: canvasSize,
            height: canvasSize,
            backgroundColor: 'rgb(230,230,230)',
            selectionColor: 'transparent',
            selectionLineWidth: 2,
        });

        // 1. 사용자 이미지 추가
        fabric.Image.fromURL(self.canvasConfig.imageSrc, function(image) {
            image.set({
                left: canvasSize / 2,
                top: canvasSize / 2,
                originX: 'center',
                originY: 'center',
                scaleX: self.canvasConfig.imageScale,
                scaleY: self.canvasConfig.imageScale,
                perPixelTargetFind: true,
                selectable: true,
                cornerColor: '#111',
                cornerSize: 10 * screenRatio,
                transparentCorners: false
            });

            image.on('selected', function(e) {
                if (e.target === self.canvasObj.image) {
                    self.canvasObj.image.set('opacity', 0.7);
                    self.canvas.renderAll();
                }
            });
    
            image.on('cleared', function(e) {
                if (self.canvasObj.image) {
                    self.canvasObj.image.set('opacity', 1);
                    self.canvas.sendToBack(self.canvasObj.image);
                    self.canvas.renderAll();
                }
            });

            self.canvas.add(image);
            self.canvasObj.image = image;

            // 2. 레이블 이미지 추가
            fabric.Image.fromURL(self.canvasConfig.labelSrc, function(label) {
                label.set({
                    left: canvasSize / 2,
                    top: canvasSize / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: canvasSize / label.width,
                    scaleY: canvasSize / label.height,
                    selectable: false,
                    evented: false
                });
                self.canvas.add(label);

                // 3. 텍스트 오브젝트 추가
                let initTextObj = new fabric.Text(self.canvasConfig.text, {
                    left: canvasSize / 2,
                    top: canvasSize * 0.65,
                    originX: 'center',
                    angle: -7,
                    fontSize: 90 * screenRatio,
                    fill: '#fff',
                    stroke: '#ff6600',
                    strokeWidth: 10 * screenRatio,
                    strokeUniform: true,
                    paintFirst: 'stroke',
                    fontFamily: 'Gothicssi',
                    fontWeight: '800',
                    shadow: new fabric.Shadow({
                        color: 'black',
                        blur: 2 * screenRatio,
                        offsetX: 8 * screenRatio,
                        offsetY: 8 * screenRatio
                    }),
                    selectable: false,
                    editable: false
                });
                self.canvas.add(initTextObj);
                self.canvasObj.text = initTextObj;
            });
        });

        self.initCanvasEvent();
        self.canvas.renderAll();
    },
    getCanvasSize: function() {
        return $('.labelEditor__display--wrapper').outerWidth();
    },
    setDocumentRatio: function() {
        this.canvasConfig.ratio = parseInt(($(document).width() / 720) * 10) / 10;
        return this.canvasConfig.ratio;
    },
    initCanvasEvent: function() {
        let self = this;

        // 캔버스 이미지 파일로 저장 (다운로드)
        $(document).on('click', '.devOrderDirect', function() {
            // 캔버스 콘텐츠를 이미지로 변환
            let dataURL = self.canvas.toDataURL({
                format: 'png',
                quality: 1
            });

            // 임시 링크 생성
            let link = document.createElement('a');
            link.download = '라벨_이미지.png';
            link.href = dataURL;

            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 주문 처리 로직
        });

    },
    modifyText: function(text) {
        let self = this;
        let textObj = self.canvasObj.text;
        if (typeof text === 'undefined') {
            text = self.canvasConfig.text;
        }
        textObj.set('text', text);
        self.canvas.renderAll();
    },
    uploadImage: function(e) {
        let self = this;
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = function(f) {
            let data = f.target.result;
            let canvasSize = self.getCanvasSize();

            if (self.canvasObj.image) {
                let maxSize = canvasSize * self.canvasConfig.imageScale;
                
                self.canvasObj.image.setSrc(data, function(img) {
                    let scale = maxSize / Math.min(img.width, img.height);
                    self.canvasObj.image.set({
                        'scaleX': scale,
                        'scaleY': scale,
                        'left': canvasSize / 2,
                        'top': canvasSize / 2,
                    });
                    self.canvas.renderAll();
                });
            }
        };
        reader.readAsDataURL(file);
    },
    resetImage: function() {
        let self = this;
        let canvasSize = self.getCanvasSize();

        self.canvasObj.image.set({
            'scaleX': self.canvasConfig.imageScale,
            'scaleY': self.canvasConfig.imageScale,
            'left': canvasSize / 2,
            'top': canvasSize / 2,
        });
        self.canvasObj.image.setSrc(self.canvasConfig.imageSrc, function(img) {
            self.canvas.renderAll();
        });
    },
    resetCanvas: function() {
        let self = this;
        if (confirm('모든 변경사항을 초기화하시겠습니까?')) {
            self.canvas.clear();
            self.initCanvas();
            $('.devModifyText').val(self.canvasConfig.text);
        }
    },
    resizeCanvas: function() {
        let self = this;
        let newRatio = self.setDocumentRatio();
        let newSize = self.getCanvasSize();
        self.canvas.setDimensions({ width: newSize, height: newSize });

        self.canvas.getObjects().forEach(function(obj) {
            if (obj.type === 'image') {
                let scale = Math.min(newSize / obj.width, newSize / obj.height);
                obj.set({
                    left: newSize / 2,
                    top: newSize / 2,
                    scaleX: scale,
                    scaleY: scale
                });
            } else if (obj.type === 'text') {
                obj.set({
                    left: newSize / 2,
                    top: newSize * 0.65,
                    fontSize: 90 * newRatio,
                    strokeWidth: 10 * newRatio
                });
                if (obj.shadow) {
                    obj.shadow.blur = 2 * newRatio;
                    obj.shadow.offsetX = 8 * newRatio;
                    obj.shadow.offsetY = 8 * newRatio;
                }
            }
            if (obj.cornerSize) {
                obj.set('cornerSize', 10 * newRatio);
            }
        });

        self.canvas.renderAll();
    },
    initEvent: function() {
        let self = this;

        $('.devModifyText').on('keyup', function() {
            let text = $(this).val();
            if (text.length === 0) {
                self.modifyText();
            } else {
                if (text.length > self.canvasConfig.textLimit) {
                    alert('텍스트는 {limit}자 미만이어야 합니다.');
                    text = text.substring(0, self.canvasConfig.textLimit);
                    $(this).val(text).blur();
                }
                self.modifyText(text);
            }
        });

        // 에디터 이미지 업로드
        $('.devUploadImage').on('click', function() {
            $('.devUploadImageFile').trigger('click');
        });

        $('.devUploadImageFile').on('change', function(e) {
            var fileName = $(this).val().split('\\').pop();
            if (fileName.length > 0) {
                $('.devUploadImageText').val(fileName);
                $('.devUploadImageWrapper').addClass('reset-active');
                self.uploadImage(e);
            } else {
                $('.devUploadImageText').val('');
                $('.devUploadImageWrapper').removeClass('reset-active');
                self.resetImage();
            }
        });

        // 에디터 이미지 삭제
        $('.devUploadImageText').on('click', function() {
            if (!$(this).hasClass('reset-active')) return false;
            self.resetImage();
        });

        // 에디터 초기화
        $('.devResetEditor').on('click', function() {
            self.resetCanvas();
        });

        // 화면 리사이즈시 캔버스 리랜더링
        $(document).on('resize', function() {
            self.resizeCanvas();
        });
    },
    run: function(){
        let self = this;

        $(document).ready(function() {
            self.initLabelSrc();
            self.initLang();
            self.initCanvas();
            self.initEvent();
        });
    }
}

$(function () {
    devGoodsLabelEditor.run();
});