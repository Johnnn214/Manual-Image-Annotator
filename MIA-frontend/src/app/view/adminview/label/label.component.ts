import { CommonModule } from '@angular/common';
import { Component, Input,  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LabelService } from '../../../services/label.service';
import { Baseurl } from '../../../../baseurl';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.css'
})
export class LabelComponent {

  newLabel: string = "";
  newSublabel: string = "";
  @Input() CollectionLabel: any[] = [];
  selectedLabelID: number | null = null;
  CollectionSublabel: any[] = [];
  CollectionID: number = 1;

  selectedSublabelID: number | null = null;
  newEditedLabel: string= "";
  newEditedSubLabel: string ="";
  errorMessageLabel!: string
  errorMessageSubLabel!: string
  iscolapse1 = true;
  iscolapse2 = false;
  iscolapse3 = true;
  iscolapse4 = false;
  ischeckedlabel = false;
  ischeckedsublabel = false;
  baseurl!: string;
  toggleColapse1(){
    this.iscolapse1 = !this.iscolapse1
  }

  toggleColapse2(){
    this.iscolapse2 = !this.iscolapse2
  }

  toggleColapse3(){
    this.iscolapse3 = !this.iscolapse3
  }

  toggleColapse4(){
    this.iscolapse4 = !this.iscolapse4
  }
  constructor(
    private labelService: LabelService,
    private route: ActivatedRoute,
    private baseUrl: Baseurl
  ) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.CollectionID = +params.get('id')!;
      //console.log("collection", this.CollectionID)
    });

    this.baseurl = this.baseUrl.getBaseUrl();
    //this.refreshLabels();
  }

  togglecheckLabel(){
    this.ischeckedlabel = !this.ischeckedlabel;
  }

  togglecheckSub(){
    this.ischeckedsublabel = !this.ischeckedsublabel;
  }
  onSelectLabel(labelID: number){
    this.labelService.getCollectionSublabel(labelID)
    .subscribe(CollectionSubabel => {
      this.CollectionSublabel = CollectionSubabel;
    });
    this.selectedLabelID = labelID;
    this.selectedSublabelID = null;
  }
  addLabel(newLabel: string, CollectionID: number){
    if(newLabel.length < 3){
      this.errorMessageLabel = "Label must be atleast 3 characters long";
    }else{
      this.labelService.addLabel(newLabel, CollectionID)
      .subscribe({
        next: () => {
          this.newLabel = "";
          this.errorMessageLabel = "";
          this.refreshLabels();
        },
        error: (error) => {
          console.error('Error adding label:', error);
          this.newLabel = "";
          this.errorMessageLabel = error.error.error;
        },
      })
    }
  }
  editLabelName(newLabel: string, labelID: number, CollectionID: number){
    if(newLabel.length < 3){
      this.errorMessageLabel = "Label must be atleast 3 characters long";
    }else{
      this.labelService.editLabelName(labelID, newLabel, CollectionID)
      .subscribe({
        next: () => {
          this.newEditedLabel = "";
          this.errorMessageLabel = "";
          this.refreshLabels();
        },
        error: (error) => {
          console.error('Error adding label:', error);
          this.newEditedLabel = "";
          this.errorMessageLabel = error.error.error;
        },
      })
    }
  }

  removeLabel() {
    if (this.selectedLabelID) {
      // Call the service method to remove the selected label
      this.labelService.removeLabel(this.selectedLabelID)
        .subscribe({
          next: () => {
            // Clear the selected label after removing it
            this.selectedLabelID = null;
            this.refreshLabels();
            this.refreshSublabels();
          },
          error: (error) => {
            console.error('Error removing label:', error);
          },
        });
    }
  }
  uploadLabelFileImage(event: any) {
    const file: File = event.target.files[0]; // Access the uploaded file from event.target.files
    const labelID: number | null = this.selectedLabelID;
    console.log(file, labelID)
    if (labelID !== null) {
      this.labelService.uploadLabelImage(labelID, file)
        .subscribe({
          next: (response) => {
            console.log('Upload successful:', response.message);
            event.target.value = null;
            this.refreshLabels();
          },
          error: (error) => {
            console.error('Upload error:', error.error);
            event.target.value = null;
            this.refreshLabels();
          },
        });
    }
  }
  refreshLabels() {
    this.labelService.getCollectionLabel(this.CollectionID)
      .subscribe(labels => {
        this.CollectionLabel = labels;
      });
  }
  onSelectSub(sublabelID: number){
    this.selectedSublabelID = sublabelID;
  }

  addSublabel(newSublabel: string){
    if (newSublabel.length < 3) {
      this.errorMessageSubLabel = "Sub-label must be atleast 3 characters long";
    }else{
      console.log("selected",this.selectedLabelID);
      this.labelService.addSublabel(newSublabel, this.selectedLabelID!)
        .subscribe({
          next: () => {
            this.newSublabel = ""; // Clear the input field
            this.errorMessageSubLabel = "";
            this.refreshSublabels(); // Refresh the sub-label list
          },
          error: (error) => {
            this.newSublabel = "";
            this.errorMessageSubLabel = error.error.error
          },
        });
    }
  }
  editSublabelName(newSublabel: string, sublabelID: number, labelID: number){
    if (newSublabel.length < 3) {
        this.errorMessageSubLabel = "Sub-label must be atleast 3 characters long";
    } else {
      this.labelService.editSubLabelName(sublabelID, newSublabel, labelID)
        .subscribe({
          next: () => {
            this.newEditedSubLabel = "";
            this.errorMessageSubLabel = "";
            this.refreshSublabels();
          },
          error: (error) => {
            console.error('Error adding sublabel:', error);
            this.newEditedSubLabel = "";
            this.errorMessageSubLabel = error.error.error
          },
        });
    }
  }

  removeSublabel(){
    if (this.selectedSublabelID) {
      // Call the service method to remove the selected label
      this.labelService.removeSublabel(this.selectedSublabelID)
        .subscribe({
          next: () => {
            // Clear the selected label after removing it
            this.selectedSublabelID = null;
            this.refreshSublabels();
          },
          error: (error) => {
            console.error('Error removing label:', error);
          },
        });
    }
  }
  uploadSubLabelFileImage(event: any) {
    const file: File = event.target.files[0]; // Access the uploaded file from event.target.files
    const sublabelID: number | null = this.selectedSublabelID;
    console.log(file, sublabelID)
    if (sublabelID !== null) {
      this.labelService.uploadSubLabelImage(sublabelID, file)
        .subscribe({
          next: (response) => {
            console.log('Upload successful:', response.message);
            this.refreshSublabels();
            event.target.value = null;
          },
          error: (error) => {
            console.error('Upload error:', error.error);
            this.refreshSublabels();
            event.target.value = null;
          },
        });
    }
  }

  refreshSublabels() {
    this.labelService.getCollectionSublabel(this.selectedLabelID!)
      .subscribe(sublabels => {
        this.CollectionSublabel = sublabels;
      });
  }


}
