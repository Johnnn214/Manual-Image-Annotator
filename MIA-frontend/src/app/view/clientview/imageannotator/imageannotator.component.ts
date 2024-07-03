import { AfterViewInit, AfterViewChecked, Component, ElementRef, Input, ViewChild, HostListener, ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnnotationService } from '../../../services/annotation.service';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { LabelService } from '../../../services/label.service';
import { Modal } from 'bootstrap';
import { Baseurl } from '../../../../baseurl';


@Component({
  selector: 'app-imageannotator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imageannotator.component.html',
  styleUrl: './imageannotator.component.css'
})
export class ImageAnnotatorComponent implements AfterViewInit, AfterViewChecked   {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;
  // zoom
  scale = 1;
  zoomFactor = 0.05;
  // drawing and selection
  previouslyselectedRectangle: any = null;
  selectedRectangle: any = null;
  isDragging = false;
  isDrawing = false;
  resizeTL=false;
  resizeTR=false;
  resizeBL=false;
  resizeBR=false;
  startX!: number|null;
  startY!: number|null;
  currentX!: number|null;
  currentY!: number|null;
  //loading image
  imageLoaded = false;
  selectedImageBefore: any;
  @Input() selectedimage: any;
  // rectangles and annotation
  annotations: any[] = [];
  // Array to control the visibility of the form pop-up for each rectangle
  showFormPopup: boolean[] = [];
  @ViewChild('popuplabel') popuplabel!: ElementRef;
  @ViewChild('popupsublabel') popupsublabel!: ElementRef;
  @ViewChild('popupform') popupform!: ElementRef;
  //labels
  @Input() CollectionLabel:any[] = [];
  CollectionID!: number;
  showSubLabel: boolean[] = [];
  // annotation list location
  isBottom = true; // Initial position
  isResizing = false;
  resizeDirection = '';
  annotationHeight = 200; // Initial height
  prevoiusannotationheight = 0;
  prevoiusannotationWidth = 275;
  annotationWidth = 0; // Initial width
  selectedLabels: any[] = [];
  selectedSublabels: any[] = [];
  baseurl!: string;



  constructor(
    private labelService: LabelService,
    private route: ActivatedRoute,
    private annotationservice: AnnotationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private baseUrl: Baseurl
  ) {

  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(params => {
      this.CollectionID = +params.get('id')!;
     // console.log("collectionid", this.CollectionID);
    });
    this.baseurl = this.baseUrl.getBaseUrl();
    this.context = this.canvasRef.nativeElement.getContext('2d')!;
  }

  async ngAfterViewChecked() {
    if (this.selectedimage && this.selectedimage !== this.selectedImageBefore) {
      console.log('selectedImage has changed:', this.selectedimage);
      this.selectedImageBefore = this.selectedimage;
      this.getAnnotations().then(() => {
        this.loadImage(); // Call loadImage after annotations are retrieved
      });  // Call loadImage after annotations are retrieved
      this.clearSelection();// clearing selection when image is changed
      this.showFormPopup.fill(false);    // Close all pop-up forms
     // console.log("collection label",this.CollectionLabel);
    }
  }

  async getAnnotations(): Promise<void> {
    try {
      const annotations = await firstValueFrom(this.annotationservice.getAnnotations(this.auth.getClientId()!, this.selectedimage.ImageID));
      this.annotations = annotations;
      //console.log("annotations", this.annotations);
      // ribbon list to set the default sublabel
      this.annotations.forEach(async (rectangle, index) => {
        // Set the default label ID for annotation list only if not set
        await this.loadSubLabels(rectangle, index);
        this.selectedLabels[index] = this.CollectionLabel.find(label => label.LabelID === rectangle.LabelID);
          //this.selectedSublabels[index] = rectangle.CollectionSublabel.find((sublabel: { Sub_LabelID: any; }) => sublabel.Sub_LabelID === rectangle.Sub_LabelID);

      });
    } catch (error) {
      console.error('Error fetching annotations:', error);
    }
  }
  async loadSubLabels(rectangle: any, index: number): Promise<void> {
    try {
      const sublabel = await firstValueFrom(this.labelService.getCollectionSublabel(rectangle.LabelID));
      const subLabelExists = await sublabel.some((sub: any) => sub.Sub_LabelID === rectangle.Sub_LabelID);
      if (!subLabelExists) {
        rectangle.Sub_LabelID = null;
      }
      rectangle.CollectionSublabel = sublabel;
      this.selectedSublabels[index] = rectangle.CollectionSublabel.find((sublabel: { Sub_LabelID: any; }) => sublabel.Sub_LabelID === rectangle.Sub_LabelID);
    } catch (error) {
      console.error('Error loading sub-labels:', error);
    }
  }
  zoomIn() {
    if (this.scale < 3) {
      this.scale += this.zoomFactor;
      this.loadImage();
    }

  }

  zoomOut() {
    if (this.scale > 0.8 || this.canvasRef.nativeElement.width > 250 ) {
      this.scale = this.scale - this.zoomFactor;
      this.loadImage();
    }
  }

 async  loadImage(imgSource: string = this.baseurl + this.selectedimage.ImageURL ) {
    const img = new Image();
    img.src = imgSource;
    img.onload = () => {
      let Width = img.width;
      let Height = img.height;
      const maxWidth = 500;
      const aspectRatio = Width / Height;
      if (Width > maxWidth) {
        Width = maxWidth;
        Height = Width / aspectRatio; // Corrected calculation for height
      }

      this.canvasRef.nativeElement.width = Width * this.scale;
      this.canvasRef.nativeElement.height = Height * this.scale;
      this.context.setTransform(this.scale, 0, 0, this.scale, 0, 0);
      this.context.drawImage(img, 0, 0, Width , Height);
      this.drawPreviousRectangles();
      this.highlightSelectedRectangle(this.selectedRectangle);
      this.imageLoaded = true;
    };
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
      const offsetX = (touch.clientX - canvasRect.left)
      const offsetY = (touch.clientY - canvasRect.top)
      this.onDown(offsetX, offsetY);
    }
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
      const offsetX = (touch.clientX - canvasRect.left)
      const offsetY = (touch.clientY - canvasRect.top)
      this.onMove(offsetX, offsetY);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    // Assuming you want to handle the end of a touch as a single point
    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
      const offsetX = (touch.clientX - canvasRect.left)
      const offsetY = (touch.clientY - canvasRect.top)
      this.onUp(offsetX, offsetY);
    }
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    let { offsetX, offsetY } = event;
    this.onDown(offsetX, offsetY);
  }

  onMouseMove(event: MouseEvent): void {
    event.preventDefault();
    let { offsetX, offsetY } = event;
    this.onMove(offsetX, offsetY);
  }

  onMouseUp(event: MouseEvent): void {
    event.preventDefault();
    let { offsetX, offsetY } = event;
    this.onUp(offsetX, offsetY);
  }


  onDown(clientX: number, clientY: number): void {
    if (!this.imageLoaded) return;

    // Adjust mouse coordinates based on the zoom level
    clientX /= this.scale;
    clientY /= this.scale;

    this.startX = clientX;
    this.startY = clientY;
    //console.log(this.startX,this.startY);
    // Check if a rectangle is selected
    if (this.selectedRectangle) {
      //checking if mouse is in rectangle selected
      this.selectRectangle(clientX, clientY);
      if(this.selectedRectangle  == this.previouslyselectedRectangle){
        // Toggle the popup for the selected rectangle
        this.togglePopupState(this.selectedRectangle, false);
          // Check if the click is on one of the resize handles
        if (this.isTopLeftResizingHandleClicked(clientX, clientY, this.selectedRectangle)){
          // Mouse is on a resize handle, start resizing
          this.resizeTL = true;
          console.log("topleft",this.resizeTL);
        } else if (this.isTopRightResizingHandleClicked(clientX, clientY, this.selectedRectangle)){
          // Mouse is on a resize handle, start resizing
          this.resizeTR = true;
          console.log("topright",this.resizeTR);
        } else if (this.isBottomLeftResizingHandleClicked(clientX, clientY, this.selectedRectangle)){
          // Mouse is on a resize handle, start resizing
          this.resizeBL = true;
          console.log("bottomleft",this.resizeBL);
        } else if (this.isBottomRightResizingHandleClicked(clientX, clientY, this.selectedRectangle)){
          // Mouse is on a resize handle, start resizing
          this.resizeBR = true;
          console.log("bottomright",this.resizeBR);
        } else {
          // If not resizing, start dragging the selected rectangle
          this.isDragging = true;
        }
      }
    } else{
      this.isDrawing = true;
    }
  }

  onMove(clientX: number, clientY: number): void {
    if (!this.imageLoaded) return;

      // Adjust mouse coordinates based on the zoom level
      clientX /= this.scale;
      clientY /= this.scale;

      const mouseX = clientX;
      const mouseY = clientY;
      // Check if dragging mode is enabled and a rectangle is selected
    if (this.selectedRectangle && this.isDragging) {
      // dagging function
      this.dragSelectedRectangle(mouseX, mouseY);
    } else if (this.selectedRectangle && this.resizeTL || this.resizeTR || this.resizeBL || this.resizeBR) {
      // resizing function
      this.resizeSelectedRectangle(mouseX, mouseY, this.selectedRectangle);
    } else if (this.isDrawing) {
      // drawing rectangle
      this.currentX = clientX;
      this.currentY = clientY;
      this.draw();
    }
  }

  onUp(clientX: number, clientY: number): void {

    // Adjust mouse coordinates based on the zoom level
    clientX /= this.scale;
    clientY /= this.scale;

    if (!this.imageLoaded) return;

    // Update selected rectangle coordinates if it exists and dragging mode is enabled
    if (this.selectedRectangle && this.isDragging || this.resizeTL || this.resizeTR || this.resizeBL || this.resizeBR) {
        this.updateSelectedRectangle(this.selectedRectangle);
        this.togglePopupState(this.selectedRectangle, true);
        this.isDragging = false;
        this.resizeTL = false;
        this.resizeBL = false;
        this.resizeBR = false;
        this.resizeTR = false;
    }
    // If drawing mode is active
    if (this.isDrawing) {
      this.isDrawing = false;
      const width = this.currentX! - this.startX!;
      const height = this.currentY! - this.startY!;
      // check minimum width and height
      if (Math.abs(width) >= 20 && Math.abs(height) >= 20 &&
        this.startX !== null && this.startY !== null &&
        this.currentX !== null && this.currentY !== null){
        this.addTemporaryRectangleAndSelect(width, height);
      } else {
        // clearing canvas if false
        this.clearCanvasAndRedraw(image =>{});
        this.selectRectangle(clientX, clientY);
      }
       // Reset coordinates
       this.resetCoordinates();
    }
  }
  resetCoordinates(): void {
    this.startX = null;
    this.startY = null;
    this.currentX = null;
    this.currentY = null;
  }

  selectRectangle(mouseX: number, mouseY: number): void {
    const clickedRectangle = this.getClickedRectangle(mouseX, mouseY);
    // Save the previously selected rectangle
    this.previouslyselectedRectangle = this.selectedRectangle ;
    // If a rectangle is already selected and the click is within its bounds, return
    if (this.selectedRectangle &&
      this.isMouseWithinRectangle(mouseX, mouseY, this.selectedRectangle)){
      return;
    }
    this.selectedRectangle = clickedRectangle; // Update selected rectangle
    this.showFormPopup.fill(false); // Close all pop-up forms
    this.removeTemporaryRectangle(); // remove temporary rectangle
    if (this.selectedRectangle) {
        this.togglePopupState(this.selectedRectangle, true);
        this.redrawCanvas(); // Highlight rectangle
        console.log('Rectangle selected', this.selectedRectangle);
    } else {
        this.clearSelection(); // Clear selection if no rectangle clicked
        this.clearCanvasAndRedraw(image =>{});
        console.log('No rectangle selected', this.selectedRectangle);
    }
  }

  addTemporaryRectangleAndSelect(width: number, height: number): void {
    // add temporary rectangle
    const newRectangle = {
      startX: this.startX,
      startY: this.startY,
      width,
      height,
      LabelID: null,
      Sub_LabelID: null,
      CollectionID: this.CollectionID,
      ClientID: this.auth.getClientId()!,
      ImageID: this.selectedimage.ImageID
    };
    this.annotations.push(newRectangle);
    //select new rectangle
    this.selectedRectangle = this.annotations.slice(-1)[0];
    this.showFormPopup.fill(false);
    this.togglePopupState(this.selectedRectangle, true);
    this.redrawCanvas();
  }

  removeTemporaryRectangle() :void{
    const tempRectangle = this.annotations.find(rectangle => !rectangle.AnnotationID);
    if (tempRectangle) {
      const tempRectangleIndex = this.annotations.indexOf(tempRectangle);
      if (tempRectangleIndex !== -1) {
        this.annotations.splice(tempRectangleIndex, 1);
      }
    }
  }

  async onSelectlabel(rectangle: any, Label: any, index: number): Promise<void> {
    this.selectedLabels[index] = Label;
    rectangle.LabelID = Label.LabelID;
    await this.loadSubLabels(rectangle, index);
    this.sublabelsPopupState(rectangle, true);
    try {
      this.submitLabel(rectangle);
    } catch (error) {
      console.error("Error submitting labels:", error);
    }
  }
  onSelectsublabel(rectangle: any, Sublabel: any, index: number): void {
    this.selectedSublabels[index] = Sublabel;
    rectangle.Sub_LabelID = Sublabel.Sub_LabelID;
    try {
      this.submitLabel(rectangle);
    } catch (error) {
      console.error("Error submitting labels:", error);
    }
  }

  selectnosublabels(rectangle: any, index: number): void {
    this.selectedSublabels[index] = null;
    rectangle.Sub_LabelID = null;
   // rectangle.CollectionSublabel = null;
    try {
      this.submitLabel(rectangle);
    } catch (error) {
      console.error("Error submitting labels:", error);
    }
    this.sublabelsPopupState(rectangle, false);
  }

  sublabelsPopupState(rectangle: any, newState: boolean): void {
    const index = this.annotations.indexOf(rectangle);
    this.showSubLabel[index] = newState;
  }
  submitLabel(rectangle: any): void {
    try {
        if (rectangle.AnnotationID) {
              this.updateSelectedRectangle(rectangle);
        }else {
            this.removeTemporaryRectangle();
            this.addNewAnnotation(rectangle);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  }

 async addNewAnnotation(rectangle: any): Promise<void> {
    this.annotationservice.addAnnotations(rectangle)
      .then(async (response) => {
         // console.log('New annotation added:', response);
          await this.getAnnotations();

          const foundRectangle = this.annotations.find(newRect =>
            newRect.startX === Math.round(rectangle.startX) &&
            newRect.startY === Math.round(rectangle.startY) &&
            newRect.width === Math.round(rectangle.width) &&
            newRect.height === Math.round(rectangle.height)
          );

        if (foundRectangle) {
            this.selectedRectangle = foundRectangle;
            this.showFormPopup.fill(false);
            this.togglePopupState(this.selectedRectangle, true);
            this.redrawCanvas();
        }

      }).catch((error) => {
          console.error('Error adding new annotation:', error);
      });
  }

  async updateSelectedRectangle(rectangle: any): Promise<void> {
    if (!rectangle.AnnotationID) {
      return;
    }
    try {
      const response = await this.annotationservice.updateAnnotation(rectangle);
     // console.log(response);
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw error;
    }
  }
  selectRectForm(rectangle: any){
    // Clear the previous selection if there was one
    if (this.selectedRectangle !== null) {
    // Clear the previous selection
    this.clearSelection();
    // Close all pop-up forms
    this.showFormPopup.fill(false);
    }
    this.selectedRectangle = rectangle;

   // this.togglePopupState(this.selectedRectangle, true);

    this.redrawCanvas();
  }
  /**
   * Toggles the pop-up state of the specified rectangle.
   * @param rectangle The rectangle to toggle the pop-up state of.
   * @param newState The new state of the pop-up for the rectangle.
   */
  togglePopupState(rectangle: any, newState: boolean): void {
    const index = this.annotations.indexOf(rectangle);
    this.showFormPopup[index] = newState;
  }
  /**
   * Deletes the specified annotation from the database.
   * @param rectangle The annotation to delete.
   */
  async deleteAnnotation(rectangle: any, index: number): Promise<void> {
    this.selectedLabels[index] = null;
    this.selectedSublabels[index] = null;
    this.clearSelection(); // Clear the selection
    if (rectangle.AnnotationID) {
      try {
        const response = await this.annotationservice.deleteAnnotation(rectangle.AnnotationID);
       // console.log('Annotation deleted:', response);
      } catch (error) {
        console.error('Error deleting annotation:', error);
      }
      await this.getAnnotations();

    } else{
      this.removeTemporaryRectangle();
    }
    this.showFormPopup.fill(false);
    this.clearCanvasAndRedraw(image => {}); // Reload the image to update the canvas
  }

  redrawCanvas(): void {
    // Clear the canvas and redraw everything
    this.clearCanvasAndRedraw(image => {
      this.drawPreviousRectangles();
      this.highlightSelectedRectangle(this.selectedRectangle);
    });

  }
  draw(): void {
    if (!this.imageLoaded) return;
    const width = this.currentX! - this.startX!;
    const height = this.currentY! - this.startY!;
    // Clear the canvas and redraw everything
    this.clearCanvasAndRedraw(image => {
      // Draw the current rectangle
      this.drawRectangle(this.startX!, this.startY!, width, height, 'red', 2);
    });
  }

  clearCanvasAndRedraw(drawCallback: (image: HTMLImageElement) => void): void {
    // Load the image
    const img = new Image();
    img.onload = () => {
        let Width = img.width;
        let Height = img.height;
        const maxWidth = 500;
        const aspectRatio = Width / Height;
        if (Width > maxWidth) {
          Width = maxWidth;
          Height = Width / aspectRatio; // Corrected calculation for height
        }
        // Clear the canvas
        this.context.clearRect(0, 0, Width, Height);
        // Draw the image
        this.context.drawImage(img, 0, 0, Width, Height);
        // Draw previously saved rectangles
        this.drawPreviousRectangles();
        // Execute the drawCallback function
        drawCallback(img);
    };
    img.src = this.baseurl + this.selectedimage.ImageURL;
  }

  drawPreviousRectangles(){
    // Draw previously saved rectangles
    this.annotations.forEach(rect => {
      this.drawRectangle(rect.startX, rect.startY, rect.width, rect.height, 'red', 2);
    });
  }

  highlightSelectedRectangle(rectangle: any): void {
    if (!rectangle) return;
    const { startX, startY, width, height } = rectangle;
    this.drawRectangle(startX, startY, width, height, 'blue', 2);
  }

  drawRectangle(x: number, y: number, width: number, height: number, color: string, lineWidth: number): void {
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.strokeRect(x, y, width, height);
    this.context.closePath();
  }

  clearSelection(): void {
    // Clear the selection by redrawing the canvas without the highlight on the selected rectangle
    this.clearCanvasAndRedraw(image =>{}); // Reload the image and redraw all rectangles
    this.selectedRectangle = null;
  }

  dragSelectedRectangle(mouseX: number, mouseY: number): void {
    const clickedRectangle = this.getClickedRectangle(mouseX, mouseY);
    // Ensure that a rectangle is selected and the mouse is within its bounds
    if (clickedRectangle) {
        // If a rectangle is already selected and the click is within its bounds, return
      if (this.selectedRectangle &&
        this.isMouseWithinRectangle(mouseX, mouseY, this.selectedRectangle)){
          // Calculate the change in mouse position
        const deltaX = mouseX - this.startX!;
        const deltaY = mouseY - this.startY!;
        // Update the position of the selected rectangle
        this.selectedRectangle.startX += deltaX;
        this.selectedRectangle.startY += deltaY;
        // Redraw the canvas with the updated rectangle positions
        // remove redrawcanvas for testing independently
        this.redrawCanvas();
        this.startX = mouseX;
        this.startY = mouseY;
      }
    }
  }

  resizeSelectedRectangle(mouseX: number, mouseY: number, rectangle: any): void {
    // Calculate the new width and height based on mouse position relative to the starting point of the selected rectangle
    // If the top left handle was clicked, the width and height of the rectangle increases
    if(this.resizeTL){
      rectangle.width += rectangle.startX - mouseX;
      rectangle.height += rectangle.startY - mouseY;
      rectangle.startX = mouseX;
      rectangle.startY = mouseY;
    }
    // If the top right handle was clicked, the width of the rectangle decreases
    // The height of the rectangle increases
    else if(this.resizeTR) {
      rectangle.width = mouseX - rectangle.startX;
      rectangle.height += rectangle.startY - mouseY;
      rectangle.startY = mouseY;
    }
    // If the bottom left handle was clicked, the width of the rectangle increases
    // The height of the rectangle decreases
    else if(this.resizeBL) {
      rectangle.width += rectangle.startX - mouseX;
      rectangle.height = mouseY - rectangle.startY;
      rectangle.startX = mouseX;
    }
    // If the bottom right handle was clicked, the width and height of the rectangle decreases
    else if(this.resizeBR) {
      rectangle.width = mouseX - rectangle.startX
      rectangle.height = mouseY - rectangle.startY
    }
    // Redraw the canvas with the updated rectangle positions
    this.redrawCanvas();
  }

  // to check if a mouse is inside redius of resize boundery
  isPointInCircle(x: number, y: number, cx: number, cy: number, radius: number): boolean {
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  // to check if a point is on a resize handle of a rectangle
  isTopLeftResizingHandleClicked(x: number, y: number, rectangle: any): boolean {
    const resizeHandleSize = 10;
    const topLeft = { x: rectangle.startX, y: rectangle.startY };
    return this.isPointInCircle(x, y, topLeft.x, topLeft.y, resizeHandleSize);
  }

  isTopRightResizingHandleClicked(x: number, y: number, rectangle: any): boolean {
    const resizeHandleSize = 10;
    const topRight = { x: rectangle.startX + rectangle.width, y: rectangle.startY };
    return this.isPointInCircle(x, y, topRight.x, topRight.y, resizeHandleSize);
  }

  isBottomLeftResizingHandleClicked(x: number, y: number, rectangle: any): boolean {
    const resizeHandleSize = 10;
    const bottomLeft = { x: rectangle.startX, y: rectangle.startY + rectangle.height };
    return this.isPointInCircle(x, y, bottomLeft.x, bottomLeft.y, resizeHandleSize);
  }

  isBottomRightResizingHandleClicked(x: number, y: number, rectangle: any): boolean {
    const resizeHandleSize = 10;
    const bottomRight = { x: rectangle.startX + rectangle.width, y: rectangle.startY + rectangle.height };
    return this.isPointInCircle(x, y, bottomRight.x, bottomRight.y, resizeHandleSize);
  }

  // Check if the click is within any existing rectangle
  getClickedRectangle(mouseX: number, mouseY: number): any | undefined {
    return this.annotations.find(rectangle => {
        const minX = Math.min(rectangle.startX, rectangle.startX + rectangle.width);
        const maxX = Math.max(rectangle.startX, rectangle.startX + rectangle.width);
        const minY = Math.min(rectangle.startY, rectangle.startY + rectangle.height);
        const maxY = Math.max(rectangle.startY, rectangle.startY + rectangle.height);

        return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
    });
  }
  // Function to check if the mouse is within the bounds of a rectangle
  isMouseWithinRectangle(mouseX: number, mouseY: number, rectangle: any): boolean {
    const minX = Math.min(rectangle.startX, rectangle.startX + rectangle.width);
    const maxX = Math.max(rectangle.startX, rectangle.startX + rectangle.width);
    const minY = Math.min(rectangle.startY, rectangle.startY + rectangle.height);
    const maxY = Math.max(rectangle.startY, rectangle.startY + rectangle.height);
    return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
  }
  calculatePopupPosition(rectangle: any, index: number): { top: number; left: number, returnwidth: string, maxheight: number } {
    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
    const { startX, startY, width, height, Sub_LabelID } = rectangle;
    const labelheight= this.popuplabel?.nativeElement.getBoundingClientRect().height;
    const sublabelheight = this.popupsublabel?.nativeElement.getBoundingClientRect().height;
    const popupWidth = 350;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const canvasRectLeft = window.scrollX + canvasRect.left;
    const canvasRectTop = window.scrollY + canvasRect.top;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth; // Get scrollbar width

    let temporaryleft = 0;
    let temporaryright = 0;
    let returnwidth = 'block';
    let maxheight = 45;

    let popupTop = canvasRectTop + Math.min(startY * this.scale, (startY + height) * this.scale);
    let popupLeft = canvasRectLeft + (startX * this.scale) + Math.max(width * this.scale, 0) + 10;

    // goes to min content if popup does not fit to the right
    if (popupLeft + popupWidth > viewportWidth - scrollbarWidth) {
      returnwidth = 'min-content';
    }
    // goes to block if pop up fits to the right
    if (popupLeft + popupWidth < viewportWidth - scrollbarWidth) {
      returnwidth = 'block';
    }
    // goes to left if min content overflow right
    if (popupLeft + popupWidth / 2 > viewportWidth - scrollbarWidth) {
      popupLeft = canvasRectLeft + Math.min((startX + width) * this.scale, startX * this.scale) - popupWidth / 2 - 10;
      returnwidth = 'min-content';
      temporaryleft = popupLeft;
    }
    // goes to right if min content overflow left
    if (temporaryleft < 0) {
      popupLeft = canvasRectLeft + (startX * this.scale) + Math.max(width * this.scale, 0) + 10;
      temporaryright = popupLeft;
    }

    if (returnwidth == 'min-content') {
      maxheight = 30;
    }else if (returnwidth == 'block'){
      maxheight = 45;
    }

      if(maxheight == 45){
        if (popupTop + (this.checkHeight(labelheight!,sublabelheight!)) > viewportHeight) {
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          -(popupTop + (this.checkHeight(labelheight!,sublabelheight!)) - viewportHeight + 10);
        }
      }

      if(maxheight == 30){
        if (popupTop + (labelheight + sublabelheight) > viewportHeight && (this.showSubLabel[index] || Sub_LabelID)) {
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          -(popupTop + (labelheight + sublabelheight!) - viewportHeight + 10);
        }else if (popupTop + labelheight > viewportHeight){
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          -(popupTop + (labelheight) - viewportHeight + 10);
        }
      }
    // Adjust position if it overflows both left and right edges
    if (temporaryright + popupWidth > viewportWidth - scrollbarWidth && temporaryleft < 0) {
      // Place in the middle block
      popupLeft = canvasRectLeft - popupWidth / 2 + ((startX + (width / 2)) * this.scale);
      returnwidth = 'block';
      // Place below
      popupTop = canvasRectTop + Math.max(startY * this.scale, startY * this.scale + height * this.scale) + 10;
      // Place in the middle min content
      if (popupLeft < 0 || (popupLeft + popupWidth > viewportWidth - scrollbarWidth)) {
        popupLeft = canvasRectLeft + ((startX + (width / 2)) * this.scale) - popupWidth / 4;
        returnwidth = 'min-content';
      }

      if (returnwidth == 'min-content') {
        maxheight = 18;
      }else if (returnwidth == 'block'){
        maxheight = 30;
      }
      if(maxheight == 30){
        if (popupTop + (this.checkHeight(labelheight!,sublabelheight!)) > viewportHeight) {
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          - this.checkHeight(labelheight!,sublabelheight!) - 10;
        }
      }
      if(maxheight == 18){
        if (popupTop + (labelheight + sublabelheight) > viewportHeight && (this.showSubLabel[index] || Sub_LabelID)) {
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          - (labelheight + sublabelheight) - 10;
        }else if(popupTop + labelheight > viewportHeight) {
          popupTop = canvasRectTop + Math.min(startY * this.scale, startY * this.scale + height * this.scale)
          - (labelheight) - 10;
        }
      }
    }
    return { top: popupTop, left: popupLeft, returnwidth: returnwidth, maxheight: maxheight };
  }

  private checkHeight(labelheight: number, sublabelheight: number) {
    if (sublabelheight === undefined) {
      return labelheight;
    } else {
      return Math.max(labelheight, sublabelheight);
    }
  }

  toggleAnnotationPosition() {
    this.isBottom = !this.isBottom;
    if(!this.isBottom){
      this.prevoiusannotationheight = this.annotationHeight;
      this.annotationWidth = this.prevoiusannotationWidth;
      this.annotationHeight = 0;
    }
    if(this.isBottom){
      this.annotationHeight = this.prevoiusannotationheight;
      this.prevoiusannotationWidth = this.annotationWidth;
      this.annotationWidth = 0;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth <= 768 && !this.isBottom) {
      this.isBottom = true;
      this.annotationHeight = 200;
    }
  }
  startResizing(event: MouseEvent | TouchEvent, direction: string) {
    this.isResizing = true;
    this.resizeDirection = direction;
    console.log("touch");
    if (event instanceof MouseEvent) {
      event.preventDefault();
    }
  }


  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onResizing(event: MouseEvent | TouchEvent) {
    if (!this.isResizing) return;
    if (this.resizeDirection === 'vertical') {
      const newHeight = window.innerHeight - (event instanceof MouseEvent ? event.clientY : (event.touches[0].clientY));
      this.annotationHeight = Math.min(newHeight, window.innerHeight * 0.5);
    } else if (this.resizeDirection === 'horizontal') {
      const newWidth = window.innerWidth - (event instanceof MouseEvent ? event.clientX : (event.touches[0].clientX));
      this.annotationWidth = Math.min(newWidth, window.innerWidth * 0.40);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopResizing() {
    this.isResizing = false;
  }

  printrectangle(){
    console.log(this.annotations);
  }

  printselectedrectangle(){
    console.log(this.selectedRectangle);
  }



}


