import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { ImageAnnotatorComponent } from './imageannotator.component';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Baseurl } from '../../../../baseurl';
import { AnnotationService } from '../../../services/annotation.service';
import { AuthService } from '../../../services/auth.service';
import { LabelService } from '../../../services/label.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ImageAnnotatorComponent', () => {
  let component: ImageAnnotatorComponent;
  let fixture: ComponentFixture<ImageAnnotatorComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ImageAnnotatorComponent, RouterTestingModule],
      providers: [ LabelService, AnnotationService,
         AuthService, ChangeDetectorRef, Baseurl ,{
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => '1' // Mocking route parameter with some id
            })
          }
        }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // zomm test
  it('should increase the scale by zoomFactor if it is less than 3', () => {
    component.scale = 1;
    spyOn(component, 'loadImage');
    component.ngAfterViewChecked()
    component.zoomIn();
    expect(component.scale).toBeLessThanOrEqual(1.05);
  });

  it('should not increase the scale if it is already 3 or more', () => {
    component.scale = 3;
    spyOn(component, 'loadImage');
    component.ngAfterViewChecked()
    component.zoomIn();
    expect(component.scale).toBe(3);
  });

  it('should call loadImage after increasing the scale', () => {
    spyOn(component, 'loadImage');
    component.zoomIn();
    expect(component.loadImage).toHaveBeenCalled();
  });

  it('should decrease scale and call loadImage when scale is greater than 0.8', () => {
    spyOn(component, 'loadImage');
    component.scale = 1.1;
    component.zoomOut();
    expect(component.scale).toBeCloseTo(1.05);
    expect(component.loadImage).toHaveBeenCalled();
  });

  it('should decrease scale and call loadImage when canvas width is greater than 250', () => {
    spyOn(component, 'loadImage');
    component.scale = 1;
    component.canvasRef.nativeElement.width = 300;
    component.zoomOut();
    expect(component.scale).toBeCloseTo(0.95);
    expect(component.loadImage).toHaveBeenCalled();
  });

  it('should not decrease scale or call loadImage when both conditions are not met', () => {
    spyOn(component, 'loadImage');
    component.scale = 0.7;
    component.canvasRef.nativeElement.width = 100;
    component.zoomOut();
    expect(component.scale).toBe(0.7);
    expect(component.loadImage).not.toHaveBeenCalled();
  });

  // loading image test

  it('should set canvas width and height based on image dimensions and scale factor', () => {
    component.selectedimage = { ImageURL: 'test-image-url' }; // Mock selectedimage
    spyOn(component, 'loadImage').and.callThrough(); // Spy on loadImage method

    fixture.detectChanges(); // Trigger change detection
    component.loadImage(); // Load the image onto the canvas

    // Access the canvas context after the image has been loaded
    const canvas = component.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    // Assert canvas width and height
    expect(canvas.width).toEqual(ctx!.canvas.width);
    expect(canvas.height).toEqual(ctx!.canvas.height);
  });


  it('should redraw canvas correctly', (done) => {
    // Mock selected image
    component.selectedimage = { ImageURL: 'test-image-url' };

    // Mock annotations
    component.annotations = [
      { startX: 10, startY: 10, width: 50, height: 50 },
      { startX: 70, startY: 70, width: 30, height: 30 },
    ];

    // Mock clearCanvasAndRedraw to call the drawCallback immediately
    spyOn(component, 'clearCanvasAndRedraw').and.callFake((drawCallback: any) => {
      drawCallback(new Image());
    });

    // Spy on internal methods
    spyOn(component, 'drawPreviousRectangles');
    spyOn(component, 'highlightSelectedRectangle');

    // Call redrawCanvas
    component.redrawCanvas();

    // Ensure canvas is cleared and all rectangles are redrawn
    fixture.detectChanges(); // Trigger change detection if needed

    // Assertion: Ensure drawPreviousRectangles and highlightSelectedRectangle were called
    expect(component.drawPreviousRectangles).toHaveBeenCalled();
    expect(component.highlightSelectedRectangle).toHaveBeenCalledWith(component.selectedRectangle);

    done();
  });

  it('should draw a rectangle on canvas', (done) => {
    // Mock selected image and imageLoaded state
    component.selectedimage = { ImageURL: 'test-image-url' };
    component.imageLoaded = true;

    // Mock startX, startY, currentX, and currentY
    component.startX = 10;
    component.startY = 10;
    component.currentX = 110;
    component.currentY = 110;

    // Mock clearCanvasAndRedraw to call the drawCallback immediately
    spyOn(component, 'clearCanvasAndRedraw').and.callFake((drawCallback: any) => {
      drawCallback(new Image());
    });

    // Call draw
    component.draw();

    // Ensure canvas is cleared and the rectangle is drawn
    fixture.detectChanges(); // Trigger change detection if needed

    // Assertion: Check if drawRectangle was called with correct parameters
    expect(component.context.strokeStyle).toBe('#ff0000'); // equals to red
    expect(component.context.lineWidth).toBe(2);
    // Add more assertions if needed based on your drawRectangle implementation

    done();
  });

  it('should clear selection and redraw canvas', (done) => {
    // Mock selectedRectangle and clearCanvasAndRedraw
    component.selectedRectangle = { startX: 10, startY: 10, width: 50, height: 50 };
    spyOn(component, 'clearCanvasAndRedraw');

    // Call clearSelection
    component.clearSelection();

    // Assertion: Ensure clearCanvasAndRedraw was called
    expect(component.clearCanvasAndRedraw).toHaveBeenCalled();
    // Add more assertions if needed based on your clearSelection implementation

    done();
  });

  it('should update selected rectangle position if a rectangle is selected and clicked', () => {
    // Mock selected image
    component.selectedimage = { ImageURL: 'test-image-url' };
    component.selectedRectangle = { startX: 10, startY: 10, width: 50, height: 50 };
    // Mock annotations
    component.annotations = [
      { startX: 10, startY: 10, width: 50, height: 50 },
      { startX: 70, startY: 70, width: 30, height: 30 },
    ];
    // Mock clearCanvasAndRedraw to call the drawCallback immediately
    spyOn(component, 'clearCanvasAndRedraw').and.callFake((drawCallback: any) => {
      drawCallback(new Image());
    });
    spyOn(component, 'loadImage') // Spy on loadImage method

    const initialStartX = component.selectedRectangle.startX;
    const initialStartY = component.selectedRectangle.startY;
    component.startX = 20;
    component.startY = 20;

    component.dragSelectedRectangle(30, 30); // Click within the bounds of the selected rectangle

    expect(component.selectedRectangle.startX).toBe(initialStartX + 10); // Check if X position updated
    expect(component.selectedRectangle.startY).toBe(initialStartY + 10); // Check if Y position updated
  });

  it('should not update selected rectangle position if no rectangle is selected or clicked', () => {
    const initialSelectedRectangle = component.selectedRectangle; // Save initial selected rectangle

    component.dragSelectedRectangle(30, 30); // Click outside any rectangle

    expect(component.selectedRectangle).toBe(initialSelectedRectangle); // Selected rectangle should remain unchanged
  });

  it('should resize selected rectangle  top left', () => {
    // Mock selected image
    component.selectedimage = { ImageURL: 'test-image-url' };
    // Mock clearCanvasAndRedraw to call the drawCallback immediately
    spyOn(component, 'clearCanvasAndRedraw').and.callFake((drawCallback: any) => {
      drawCallback(new Image());
    });
    spyOn(component, 'loadImage') // Spy on loadImage method

    const rectangle = { startX: 10, startY: 10, width: 50, height: 50 };
    component.resizeTL = true;
    // Simulate resize action
    component.resizeSelectedRectangle(20, 20, rectangle);

    // Assert: Check that rectangle dimensions are updated correctly
    expect(rectangle.startX).toBe(20);
    expect(rectangle.startY).toBe(20);
    expect(rectangle.width).toBeCloseTo(40); // Adjust based on your resize logic
    expect(rectangle.height).toBeCloseTo(40); // Adjust based on your resize logic

  });

  it('should detect top left resizing handle click', () => {
    const rectangle = { startX: 10, startY: 10, width: 50, height: 50 };
    const clickX = 12;
    const clickY = 12;

    const result = component.isTopLeftResizingHandleClicked(clickX, clickY, rectangle);

    expect(result).toBeTrue();
  });

  it('should detect mouse within rectangle bounds', () => {
    const rectangle = { startX: 10, startY: 10, width: 50, height: 50 };
    const mouseX = 20;
    const mouseY = 20;

    const result = component.isMouseWithinRectangle(mouseX, mouseY, rectangle);

    expect(result).toBeTrue();
  });

  it('should return clicked rectangle', () => {
    // Mock annotations array with sample rectangles
    component.annotations = [
      { startX: 10, startY: 10, width: 50, height: 50 },
      { startX: 100, startY: 100, width: 50, height: 50 },
    ];

    // Call getClickedRectangle with mouse coordinates inside the first rectangle
    const clickedRect = component.getClickedRectangle(15, 15);

    // Assert: Expect the first rectangle to be returned
    expect(clickedRect).toEqual(component.annotations[0]);
  });

  it('should not return any rectangle if not clicked', () => {
    // Mock annotations array with sample rectangles
    component.annotations = [
      { startX: 10, startY: 10, width: 50, height: 50 },
      { startX: 100, startY: 100, width: 50, height: 50 },
    ];

    // Call getClickedRectangle with mouse coordinates outside any rectangle
    const clickedRect = component.getClickedRectangle(70, 70);

    // Assert: Expect undefined since no rectangle was clicked
    expect(clickedRect).toBeUndefined();
  });

  it('should return true if mouse is within rectangle', () => {
    const rectangle = { startX: 10, startY: 10, width: 50, height: 50 };

    // Call isMouseWithinRectangle with mouse coordinates inside the rectangle
    const result = component.isMouseWithinRectangle(15, 15, rectangle);

    // Assert: Expect true since (15, 15) is inside (10, 10, 60, 60)
    expect(result).toBe(true);
  });

  it('should return false if mouse is outside rectangle', () => {
    const rectangle = { startX: 10, startY: 10, width: 50, height: 50 };

    // Call isMouseWithinRectangle with mouse coordinates outside the rectangle
    const result = component.isMouseWithinRectangle(70, 70, rectangle);

    // Assert: Expect false since (70, 70) is outside (10, 10, 60, 60)
    expect(result).toBe(false);
  });
});


