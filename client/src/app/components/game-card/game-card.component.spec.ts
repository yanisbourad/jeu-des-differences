// import { OverlayModule } from '@angular/cdk/overlay';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GameInfoComponent } from '@app/components/game-info/game-info.component';
// import { GameCardComponent } from './game-card.component';

// describe('GameCardComponent', () => {
//     let component: GameCardComponent;
//     let fixture: ComponentFixture<GameCardComponent>;
//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GameCardComponent],
//             imports: [OverlayModule, MatDialogModule, RouterTestingModule],
//             providers: [MatDialog, GameInfoComponent],
//         }).compileComponents();
//         fixture = TestBed.createComponent(GameCardComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });
// });

// it('should create', () => {
//     expect(component).toBeTruthy();
// });
//     it('should open dialog', () => {
//         const spy = spyOn(component.dialog, 'open').and.callThrough();

//         component.openDialog();

//         expect(spy).toHaveBeenCalledWith(NamePopupComponent, { data: { name: undefined, gameName: 'Test' } });
// Check if dialog is opened with correct parameters

//     });

//     it('should change button text to "Classique" when on classique page', () =>

//         const result = spyOnProperty(component['rout

//         component.changeButton();  // Call function to check result

//         expect(result).toBe('Classique'); // Check if result is correct

//     });
//     it('should change button text to "Classique" when on configurati

//         const result = spyOnProperty(component['router'], 'url').and.returnValue('/configuration'); // Mock router url to classique page

//         component.changeButton();  // Call function to check result

//         expect(result).toBe('Configuration'); // Check if result is correct

//     });
