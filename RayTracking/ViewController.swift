//
//  ViewController.swift
//  RayTracking
//
//  Created by gaoboyuan on 2019/2/2.
//  Copyright © 2019 gaoboyuan. All rights reserved.
//

import UIKit
import Metal
import MetalKit

class ViewController: UIViewController {

    var device: MTLDevice!
    
    var metalLayer: CAMetalLayer!
    
    var vertexBuffer: MTLBuffer!
    
    var pipelineState: MTLRenderPipelineState!
    
    var commandQueue: MTLCommandQueue!
    
    // 保持60FPS
    var timer: CADisplayLink!

    override func viewDidLoad() {
        super.viewDidLoad()

        // 创建个device(类似d3d11device)
        device = MTLCreateSystemDefaultDevice()
        // 创建个layer (需要这样一个CALayer作为画布）
        metalLayer = CAMetalLayer()
        // 一些常规配置
        metalLayer.device = device
        metalLayer.pixelFormat = .bgra8Unorm
        metalLayer.framebufferOnly = true
        metalLayer.frame = view.layer.frame
        view.layer.addSublayer(metalLayer)
        
        // 创建个vertex data buffer(OGLES 的 VAO).
        let vertexData: [Float] = [
            -1.0, -1.0,
            -1.0,  1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]
        
        let dataSize = vertexData.count * MemoryLayout.size(ofValue: vertexData[0]) // 1
        vertexBuffer = device.makeBuffer(bytes: vertexData, length: dataSize, options: []) // 2
        
        // 创建 Render Pipeline
        // shader里写的函数要在CPU端预先定义下
        // 先创建一个对应precompiled shader的library
        // 直接读工程中的metal文件
        let defaultLibrary = device.makeDefaultLibrary()!
        let fragmentProgram = defaultLibrary.makeFunction(name: "basic_fragment")
        let vertexProgram = defaultLibrary.makeFunction(name: "basic_vertex")
        
        // 为啥这些shader object 都要在cpu端定义下呢？
        
        // 创建对应的pipeline描述，根据对应描述创建pipeline，和d3d11有点像
        // 不是structure..因为兼容OC，是个NSObject
        let pipelineStateDescriptor = MTLRenderPipelineDescriptor()
        pipelineStateDescriptor.vertexFunction = vertexProgram
        pipelineStateDescriptor.fragmentFunction = fragmentProgram
        pipelineStateDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm
        
        
        // 拿对应的描述创建pipeline
        // 什么情况下会失败有待查明
        pipelineState = try! device.makeRenderPipelineState(descriptor: pipelineStateDescriptor)

        // 创建一个command队列，发送GPU消息
        commandQueue = device.makeCommandQueue()
        
        // Create a Display Link
        // Create a Render Pass Descriptor
        // Create a Command Buffer
        // Create a Render Command Encoder
        // Commit your Command Buffer
        
//        timer = CADisplayLink(target: self, selector: #selector(gameloop))
//        timer.add(to: RunLoop.main, forMode: .default)

        render()
    }

    func render() {
        guard let drawable = metalLayer?.nextDrawable() else { return }
        let renderPassDescriptor = MTLRenderPassDescriptor()
        renderPassDescriptor.colorAttachments[0].texture = drawable.texture
        renderPassDescriptor.colorAttachments[0].loadAction = .clear
        renderPassDescriptor.colorAttachments[0].clearColor = MTLClearColor(
            red: 0.0,
            green: 104.0/255.0,
            blue: 55.0/255.0,
            alpha: 1.0)
        // 队列需要拿到一个command buffer(类似于OGL ES里每个对象都是和一个GLBuffer绑定)
        // 这个在每一帧里执行是不是有点浪费，一会儿试试挪到外面去
        let commandBuffer = commandQueue.makeCommandBuffer()!
        // RenderPass 每帧的设定
        let renderEncoder = commandBuffer
            .makeRenderCommandEncoder(descriptor: renderPassDescriptor)!
        renderEncoder.setRenderPipelineState(pipelineState)
        renderEncoder.setVertexBuffer(vertexBuffer, offset: 0, index: 0)
        renderEncoder
            .drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: 4, instanceCount: 1)
        renderEncoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
    
    @objc func gameloop() {
//        autoreleasepool {
            self.render()
//        }
    }
    
}

